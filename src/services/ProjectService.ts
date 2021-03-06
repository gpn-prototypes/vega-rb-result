import {
  ApolloClient,
  FetchResult,
  NormalizedCacheObject,
} from '@apollo/client';
import { FetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { GET_RECENTLY_EDITED } from '@app/components/CompetitiveAccess/queries';
import {
  GET_DECIMAL,
  GET_HISTOGRAM_RESULT_RB,
  GET_HISTOGRAM_STATISTICS_RESULT_RB,
  GET_PROJECT_NAME,
  GET_SENSITIVE_ANALYSIS_RESULT_RB,
  GET_SENSITIVE_ANALYSIS_STATISTIC_RESULT_RB,
  GET_TABLE_RESULT_RB,
  GET_TABLE_TEMPLATE,
} from '@app/components/TableResultRbController/queries';
import {
  HistogramStatistic,
  ProjectInner,
  ProjectStructure,
  Query,
  ResultHistogramsStructure,
  ResultProjectStructure,
  SensitivityAnalysisStatisticStructure,
  SensitivityAnalysisStructure,
} from '@app/generated/graphql';
import { ProjectDecimal } from '@app/interfaces/DecimalInterface';
import {
  GENERATE_CALCULATION_RESULT_ARCHIVE,
  SET_DECIMAL,
} from '@app/pages/RbResult/mutations';
import {
  CalculationResponse,
  IProjectService,
  ProjectServiceProps,
} from '@app/services/types';
import {
  getGraphqlUri,
  // wrapConception,
} from '@app/services/utils';
import { CurrentProject, Identity, Project } from '@app/types';
import { get, getOr } from 'lodash/fp';
import { None } from 'monet';

// import { resolveDomainObjects } from './resolvers';

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

function throwError(message: string): never {
  throw new Error(`[RB/ProjectService]: ${message}`);
}

class ProjectService implements IProjectService {
  abortControllerMod: AbortController | undefined;

  clientMod: ApolloClient<NormalizedCacheObject> | undefined;

  fetchPolicyMod: FetchPolicy = 'network-only';

  identityMod: Identity | undefined;

  projectMod: ConcurrentProject | undefined;

  projectShellMod: CurrentProject | undefined;

  // diffErrorTypenameMod = 'UpdateProjectInnerDiff';

  get abortController(): AbortController {
    if (this.abortControllerMod === undefined)
      throw Error("Controller hasn't been initialized");

    return this.abortControllerMod;
  }

  get client() {
    return this.clientMod as ApolloClient<NormalizedCacheObject>;
  }

  get identity() {
    return this.identityMod as Identity;
  }

  get projectId(): string {
    return String(this.projectShellMod?.get().vid);
  }

  get version(): number {
    return Number(this.projectShellMod?.get().version);
  }

  get project(): ConcurrentProject {
    return this.projectMod as ConcurrentProject;
  }

  static isProject(data: Data): data is Partial<ProjectInner> {
    return data?.__typename === 'ProjectInner';
  }

  init({ client, project, identity }: ProjectServiceProps): ProjectService {
    this.clientMod = client;
    this.identityMod = identity;
    this.projectShellMod = project;

    return this;
  }

  // setAbortController(): void {
  //   this.#abortController = new AbortController();
  // }

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

  async getTableTemplate(): Promise<ProjectStructure> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_TABLE_TEMPLATE,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        fetchPolicy: this.fetchPolicyMod,
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

  async getProjectName(): Promise<string> {
    const { data: responseData } = await this.client
      .watchQuery({
        query: GET_PROJECT_NAME,
        variables: {
          vid: this.projectId,
        },
        fetchPolicy: this.fetchPolicyMod,
      })
      .result();

    return responseData.project.name;
  }

  async getResourceBaseData(): Promise<ResultProjectStructure> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_TABLE_RESULT_RB,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        fetchPolicy: 'no-cache',
      })
      .result();

    this.trySetupWorkingProject(responseData);

    return getOr(
      None<ResultProjectStructure>(),
      ['project', 'resourceBase', 'result', 'resultTable', 'template'],
      responseData,
    );
  }

  async getHistogramData(
    domainEntityNames: string[],
    bins: number,
  ): Promise<ResultHistogramsStructure> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_HISTOGRAM_RESULT_RB,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        variables: {
          domainEntityNames,
          bins,
        },
        fetchPolicy: 'no-cache',
      })
      .result();

    this.trySetupWorkingProject(responseData);

    return getOr(
      None<ResultHistogramsStructure>(),
      ['project', 'resourceBase', 'result', 'histograms'],
      responseData,
    );
  }

  async getDecimalData(): Promise<ProjectDecimal[]> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_DECIMAL,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        fetchPolicy: 'no-cache',
      })
      .result();

    return getOr(
      None<ProjectDecimal[]>(),
      ['project', 'resourceBase', 'decimals', 'projectDecimals'],
      responseData,
    );
  }

  async setDecimalData(attributeCode: string, decimal: number): Promise<void> {
    await this.client
      .watchQuery<Query>({
        query: SET_DECIMAL,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        variables: {
          version: this.version,
          attributeCode,
          decimal_place: decimal,
        },
        fetchPolicy: 'no-cache',
      })
      .result();
  }

  async getHistogramStatisticsData(
    domainEntityNames: string[],
    bins: number,
  ): Promise<HistogramStatistic[]> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_HISTOGRAM_STATISTICS_RESULT_RB,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        variables: {
          domainEntityNames,
          bins,
        },
        fetchPolicy: 'no-cache',
      })
      .result();

    this.trySetupWorkingProject(responseData);

    return getOr(
      None<HistogramStatistic[]>(),
      [
        'project',
        'resourceBase',
        'result',
        'histograms',
        'getHistogramReservesStatistics',
        'statistics',
      ],
      responseData,
    );
  }

  async getSensitiveAnalysisData(
    domainEntityNames: string[],
  ): Promise<SensitivityAnalysisStructure> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_SENSITIVE_ANALYSIS_RESULT_RB,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        variables: {
          domainEntityNames,
        },
        fetchPolicy: 'no-cache',
      })
      .result();

    this.trySetupWorkingProject(responseData);

    return getOr(
      None<ResultHistogramsStructure>(),
      ['project', 'resourceBase', 'result', 'histograms'],
      responseData,
    );
  }

  async getSensitiveAnalysisStatistic(
    domainEntityNames: string[],
  ): Promise<SensitivityAnalysisStatisticStructure> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GET_SENSITIVE_ANALYSIS_STATISTIC_RESULT_RB,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        variables: {
          domainEntityNames,
        },
        fetchPolicy: 'no-cache',
      })
      .result();

    this.trySetupWorkingProject(responseData);

    return getOr(
      None<ResultHistogramsStructure>(),
      ['project', 'resourceBase', 'result', 'histograms'],
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
        fetchPolicy: this.fetchPolicyMod,
      })
      .then(({ data }) => data.project.recentlyEdited);
  }

  trySetupWorkingProject(data: Query) {
    if (ProjectService.isProject(data.project)) {
      // ProjectService.assertRequiredFields(data.project);
      const isTemplateProject = Boolean(
        data.project.rbResult?.result?.resultTable?.template,
      );
      // TODO - refactor after work with data

      this.projectMod = isTemplateProject
        ? ({
            ...data.project,
            rbResult: {
              ...data.project.rbResult,
              result: {
                ...data.project.rbResult?.result,
                template: data.project.rbResult?.result?.resultTable?.template,
              },
            },
          } as ConcurrentProject)
        : (data.project as ConcurrentProject);
    } else {
      throwError('"project" is not found in query');
    }
  }

  async generateCalculationResultArchiveProcessId(
    statistics: boolean,
    projectData: boolean,
    samples: boolean,
    plots: boolean,
  ): Promise<string> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: GENERATE_CALCULATION_RESULT_ARCHIVE,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        variables: {
          version: this.version,
          statistics,
          projectData,
          samples,
          plots,
        },
        fetchPolicy: 'no-cache',
      })
      .result();

    return getOr(
      None<ResultHistogramsStructure>(),
      [
        'project',
        'resourceBase',
        'generateCalculationResultArchive',
        'processId',
      ],
      responseData,
    );
  }

  async getCalculationArchive(url: string): Promise<CalculationResponse> {
    const DEFAULT_FILENAME = 'result.zip';

    const token = await this.identity.getToken();
    const serverResponse = await fetch(url, {
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

  // private async updateCachedProject(): Promise<void> {
  //   const cached = await this.client.readQuery({
  //     query: LOAD_PROJECT,
  //   });
  //
  //   if (cached && cached.project) {
  //     this.trySetupWorkingProject(cached);
  //     return;
  //   }
  //
  //   const rbData = await this.getResourceBaseData();
  //
  //   if (rbData) {
  //     return;
  //   }
  //
  //   await this.getTableTemplate();
  // }

  // async getDiffResolvingConfig() {
  //   const domainObjectsRoute =
  //     'projectInput.conceptions.0.structure.domainObjects';
  //
  //   return {
  //     maxAttempts: 20,
  //     errorTypename: this.#diffErrorTypename,
  //     mergeStrategy: {
  //       default: 'smart',
  //       resolvers: [[`${domainObjectsRoute}`, resolveDomainObjects]],
  //     },
  //     projectAccessor: {
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       fromDiffError: (data: Record<string, any>) => ({
  //         remote: {
  //           version: data.remoteProject.version,
  //           projectInput: wrapConception({
  //             name: 'conception_1',
  //             description: '',
  //             probability: 1,
  //             structure: repackTableData(data.remoteProject),
  //           }),
  //         },
  //         local: {
  //           version: this.version,
  //           projectInput: wrapConception({
  //             name: 'conception_1',
  //             description: '',
  //             probability: 1,
  //             structure: repackTableData(this.project),
  //           }),
  //         },
  //       }),
  //     },
  //   };
  // }

  // async getCachedRbData(): Promise<CachedProjectData> {
  //   await this.updateCachedProject();
  //
  //   return {
  //     version: this.project.version,
  //     structure: getOr(
  //       None<ProjectStructureInput>(),
  //       [
  //         'resourceBase',
  //         'project',
  //         'loadFromDatabase',
  //         'conceptions',
  //         0,
  //         'structure',
  //       ],
  //       this.project,
  //     ),
  //   };
  // }
}

const projectService = new ProjectService();

export default projectService;
