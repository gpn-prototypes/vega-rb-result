import {
  ApolloClient,
  FetchResult,
  NormalizedCacheObject,
} from '@apollo/client';
import { FetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { GET_RECENTLY_EDITED } from '@app/components/CompetitiveAccess/queries';
import {
  ProjectInner,
  ProjectStructure,
  ProjectStructureInput,
  Query,
  RbProject,
} from '@app/generated/graphql';
import { get, getOr } from 'lodash/fp';
import { None } from 'monet';
import {
  GET_PROJECT_NAME,
  GET_TABLE_TEMPLATE,
  LOAD_PROJECT,
} from '@app/components/TableResultRbController/queries';
import {
  CachedProjectData,
  IProjectService,
  ProjectServiceProps,
} from '@app/services/types';
import {
  getGraphqlUri,
  wrapConception,
} from '@app/services/utils';
import { CurrentProject, Identity, Project } from '@app/types';

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



function throwError(message: string): never {
  throw new Error(`[RB/ProjectService]: ${message}`);
}

class ProjectService implements IProjectService {
  #abortController: AbortController | undefined;

  #client: ApolloClient<NormalizedCacheObject> | undefined;

  #fetchPolicy: FetchPolicy = 'network-only';

  #identity: Identity | undefined;

  #project: ConcurrentProject | undefined;

  #projectShell: CurrentProject | undefined;

  #diffErrorTypename = 'UpdateProjectInnerDiff';

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
