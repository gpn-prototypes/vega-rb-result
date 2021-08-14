import {
  ApolloClient,
  FetchResult,
  NormalizedCacheObject,
} from '@apollo/client';
import { FetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { GET_RECENTLY_EDITED } from '@app/components/CompetitiveAccess/queries';
import { GridCollection } from 'components/ExcelTable/types';
import {
  CalculatedOrError,
  DefaultPercentilesEnum,
  DistributionDefinitionError,
  DistributionInput,
  DistributionParameter,
  Error as CommonError,
  MethodTypeEnum,
  Mutation,
  ProjectInner,
  ProjectStructure,
  ProjectStructureInput,
  Query,
  RbProject,
  ValidationError,
} from '@app/generated/graphql';
import { get, getOr } from 'lodash/fp';
import { Just, None } from 'monet';
import {
  GET_PROJECT_NAME,
  GET_TABLE_TEMPLATE,
  LOAD_PROJECT,
  SAVE_PROJECT,
} from '@app/components/TableResultRbController/queries';
import {
  CachedProjectData,
  CalculationResponse,
  CalculationSettings,
  DistributionResponse,
  IProjectService,
  ProjectServiceProps,
} from '@app/services/types';
import {
  getDownloadResultUri,
  getGraphqlUri,
  wrapConception,
} from '@app/services/utils';
import { CurrentProject, Identity, Project } from '@app/types';
import { packTableData, unpackTableData } from '@app/utils';

import { resolveDomainObjects } from './resolvers';

type Data = FetchResult['data'];

type ConcurrentProject = ProjectInner & Project;

const getProjectStructure = (
  project: Partial<ProjectInner>,
): ProjectStructure | undefined => {
  return get(
    [
      'resourceBase',
      'project',
      'loadFromDatabase',
      'conceptions',
      0,
      'structure',
    ],
    project,
  );
};

export const repackTableData = (
  project: Project,
  input?: ProjectStructureInput,
): ProjectStructureInput => {
  const structure = getProjectStructure(project);

  if (structure === undefined) {
    throw new Error('Cannot repack table data without project structure');
  }

  const data = unpackTableData(structure, project.version);

  return packTableData(data, input ?? structure);
};

function throwError(message: string): never {
  throw new Error(`[RB/ProjectService]: ${message}`);
}

export const defaultCalculationSettings: CalculationSettings = {
  method: MethodTypeEnum.MonteCarlo,
  iterationNumber: 10000,
  percentiles: [
    DefaultPercentilesEnum.P90,
    DefaultPercentilesEnum.P50,
    DefaultPercentilesEnum.P10,
  ],
};

class ProjectService implements IProjectService {
  #abortController: AbortController | undefined;

  #client: ApolloClient<NormalizedCacheObject> | undefined;

  #fetchPolicy: FetchPolicy = 'network-only';

  #identity: Identity | undefined;

  #project: ConcurrentProject | undefined;

  #projectShell: CurrentProject | undefined;

  #diffErrorTypename = 'UpdateProjectInnerDiff';

  #calculationSettings: CalculationSettings = defaultCalculationSettings;

  get abortController(): AbortController {
    if (this.#abortController === undefined)
      throw Error("Controller hasn't been initialized");

    return this.#abortController;
  }

  get client() {
    return this.#client as ApolloClient<NormalizedCacheObject>;
  }

  get identity() {
    return this.#identity as Identity;
  }

  get projectId(): string {
    return String(this.#projectShell?.get().vid);
  }

  get version(): number {
    return Number(this.#projectShell?.get().version);
  }

  get project(): ConcurrentProject {
    return this.#project as ConcurrentProject;
  }

  get calculationSettings(): CalculationSettings {
    return this.#calculationSettings;
  }

  static getDistributionValue({
    distributionChart,
  }: DistributionResponse): number | null {
    return Just(
      distributionChart?.visiblePercentile.point.x as number,
    ).orNull();
  }

  static isProject(data: Data): data is Partial<ProjectInner> {
    return data?.__typename === 'ProjectInner';
  }

  private static assertRequiredFields(
    project: Partial<ProjectInner>,
  ): asserts project is Project {
    if (typeof project.version !== 'number') {
      throwError('Missing project version');
    }

    if (typeof project.vid !== 'string') {
      throwError('Missing project vid');
    }
  }

  init({ client, project, identity }: ProjectServiceProps): ProjectService {
    this.#client = client;
    this.#identity = identity;
    this.#projectShell = project;
    this.#calculationSettings = defaultCalculationSettings;

    return this;
  }

  setAbortController(): void {
    this.#abortController = new AbortController();
  }

  async getStructure(): Promise<ProjectStructure> {
    let structure = getProjectStructure(this.project);

    if (structure === undefined) {
      try {
        structure = await this.getTableTemplate();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Cannot fetch resource base structure');
        throw error;
      }
    }

    return structure;
  }

  async saveProject(table: GridCollection): Promise<FetchResult> {
    const structure = await this.getStructure();
    const currentStructure = packTableData(table, structure);
    const CONCEPTION_NAME = 'conception_1';
    this.#abortController = new AbortController();

    return this.client.mutate<Mutation>({
      mutation: SAVE_PROJECT,
      context: {
        uri: getGraphqlUri(this.projectId),
        projectDiffResolving: await this.getDiffResolvingConfig(),
        fetchOptions: {
          signal: this.#abortController.signal,
        },
      },
      variables: {
        projectInput: wrapConception({
          name: CONCEPTION_NAME,
          description: '',
          probability: 1,
          structure: currentStructure,
        }),
        version: this.version,
      },
    });
  }

  async getTableTemplate(): Promise<ProjectStructure> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_TABLE_TEMPLATE,
        variables: {
          vid: this.projectId,
        },
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        fetchPolicy: this.#fetchPolicy,
      })
      .result();

    this.trySetupWorkingProject(responseData);

    return getOr(
      None<ProjectStructure>(),
      [
        'project',
        'resourceBase',
        'project',
        'template',
        'conceptions',
        0,
        'structure',
      ],
      responseData,
    );
  }

  async getCalculationArchive(fileId: string): Promise<CalculationResponse> {
    const DEFAULT_FILENAME = 'result.zip';

    const token = await this.identity.getToken();
    const serverResponse = await fetch(getDownloadResultUri(fileId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const filename = serverResponse.headers
      .get('Content-Disposition')
      ?.match('filename="(?<filename>.*)"')?.groups?.filename;

    return {
      filename: filename || DEFAULT_FILENAME,
      data: await serverResponse.blob(),
    };
  }

  async getCalculationSettings(): Promise<void> {
    const { data: responseData } = await this.client.query({
      query: GET_PROJECT_CALCULATION_SETTINGS,
      variables: {
        vid: this.projectId,
      },
      context: {
        uri: getGraphqlUri(this.projectId),
      },
      fetchPolicy: 'no-cache',
    });

    const loadedSettings: CalculationSettings = getOr(
      None<CalculationSettings>(),
      ['project', 'resourceBase', 'project', 'calculationProperties'],
      responseData,
    );

    if (loadedSettings) {
      this.#calculationSettings = {
        method: loadedSettings.method || defaultCalculationSettings.method,
        iterationNumber:
          loadedSettings.iterationNumber ||
          defaultCalculationSettings.iterationNumber,
        percentiles:
          loadedSettings.percentiles || defaultCalculationSettings.percentiles,
      };
    }
  }

  async saveCalculationSettings(
    data: CalculationSettings,
  ): Promise<CommonError | ValidationError | null> {
    const { data: responseData } = await this.client.mutate<Mutation>({
      mutation: SAVE_PROJECT_CALCULATION_SETTINGS,
      context: {
        uri: getGraphqlUri(this.projectId),
        projectDiffResolving: await this.getCalculationSettingsDiffResolvingConfig(),
      },
      variables: {
        data,
        version: this.version,
      },
    });

    const result = getOr(
      None<CommonError | ValidationError>(),
      ['project', 'resourceBase', 'saveCalculationProperties', 'result'],
      responseData,
    );

    if (!result) {
      this.#calculationSettings = data;
    }

    return result;
  }

  async getProjectName(): Promise<string> {
    const { data: responseData } = await this.client
      .watchQuery({
        query: GET_PROJECT_NAME,
        variables: {
          vid: this.projectId,
        },
        fetchPolicy: this.#fetchPolicy,
      })
      .result();

    return responseData.project.name;
  }

  async getResourceBaseData(): Promise<RbProject> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: LOAD_PROJECT,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        fetchPolicy: this.#fetchPolicy,
      })
      .result();

    this.trySetupWorkingProject(responseData);

    return getOr(
      None<RbProject>(),
      ['project', 'resourceBase', 'project', 'loadFromDatabase'],
      responseData,
    );
  }

  async getCalculationResultFileId(tableData: GridCollection) {
    const structure = await this.getStructure();
    const currentStructure = packTableData(tableData, structure);

    const { data: responseData } = await this.client.mutate<Mutation>({
      mutation: CALCULATION_PROJECT,
      context: {
        uri: getGraphqlUri(this.projectId),
        projectDiffResolving: await this.getDiffResolvingConfig(),
      },
      fetchPolicy: 'no-cache',
      variables: {
        version: this.version,
        projectInput: wrapConception({
          name: 'conception_1',
          description: 'описание',
          probability: 1,
          structure: currentStructure,
        }),
      },
    });

    return getOr(
      None<CalculatedOrError>(),
      ['project', 'resourceBase', 'calculateProject'],
      responseData,
    );
  }

  getProjectRecentlyEdited() {
    return this.client
      .query({
        query: GET_RECENTLY_EDITED,
        variables: {
          vid: this.projectId,
        },
        fetchPolicy: this.#fetchPolicy,
      })
      .then(({ data }) => data.project.recentlyEdited);
  }

  async getDistribution({
    type,
    definition,
    parameters,
    minBound,
    maxBound,
  }: DistributionInput): Promise<DistributionResponse> {
    const { data: responseData } = await this.client
      .watchQuery({
        query: GET_DISTRIBUTION_VALUE,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        fetchPolicy: 'no-cache',
        variables: {
          distribution: {
            parameters: (parameters as DistributionParameter[]).map(
              ({ __typename, ...parameter }) => parameter,
            ),
            type,
            definition,
            minBound,
            maxBound,
          },
        },
      })
      .result();

    try {
      const distributionChart = get(
        ['project', 'resourceBase', 'distribution', 'distributionChart'],
        responseData,
      );
      const errors = distributionChart?.errors;

      return {
        distributionChart,
        errors,
      };
    } catch (error) {
      return {
        errors: [error.message] as DistributionDefinitionError[],
      };
    }
  }

  trySetupWorkingProject(data: Query) {
    if (ProjectService.isProject(data.project)) {
      ProjectService.assertRequiredFields(data.project);
      const isTemplateProject = Boolean(
        data.project.resourceBase?.project?.template,
      );
      this.#project = isTemplateProject
        ? {
            ...data.project,
            resourceBase: {
              ...data.project.resourceBase,
              project: {
                ...data.project.resourceBase?.project,
                loadFromDatabase: data.project.resourceBase?.project?.template,
              },
            },
          }
        : data.project;
    } else {
      throwError('"project" is not found in query');
    }
  }

  private async updateCachedProject(): Promise<void> {
    const cached = await this.client.readQuery({
      query: LOAD_PROJECT,
    });

    if (cached && cached.project) {
      this.trySetupWorkingProject(cached);
      return;
    }

    const rbData = await this.getResourceBaseData();

    if (rbData) {
      return;
    }

    await this.getTableTemplate();
  }

  async getDiffResolvingConfig() {
    const domainObjectsRoute =
      'projectInput.conceptions.0.structure.domainObjects';

    return {
      maxAttempts: 20,
      errorTypename: this.#diffErrorTypename,
      mergeStrategy: {
        default: 'smart',
        resolvers: [[`${domainObjectsRoute}`, resolveDomainObjects]],
      },
      projectAccessor: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fromDiffError: (data: Record<string, any>) => ({
          remote: {
            version: data.remoteProject.version,
            projectInput: wrapConception({
              name: 'conception_1',
              description: '',
              probability: 1,
              structure: repackTableData(data.remoteProject),
            }),
          },
          local: {
            version: this.version,
            projectInput: wrapConception({
              name: 'conception_1',
              description: '',
              probability: 1,
              structure: repackTableData(this.project),
            }),
          },
        }),
      },
    };
  }

  async getCalculationSettingsDiffResolvingConfig() {
    // TODO fix resolving
    return {
      maxAttempts: 20,
      errorTypename: this.#diffErrorTypename,
      mergeStrategy: {
        default: 'replace',
      },
      projectAccessor: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fromDiffError: (data: Record<string, any>) => {
          return {
            remote: {
              version: data.remoteProject.version,
            },
            local: {
              version: this.version,
              data: this.#calculationSettings,
            },
          };
        },
      },
    };
  }

  async getCachedRbData(): Promise<CachedProjectData> {
    await this.updateCachedProject();

    return {
      version: this.project.version,
      structure: getOr(
        None<ProjectStructureInput>(),
        [
          'resourceBase',
          'project',
          'loadFromDatabase',
          'conceptions',
          0,
          'structure',
        ],
        this.project,
      ),
    };
  }
}

const projectService = new ProjectService();

export default projectService;
