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
  IProjectService,
  ProjectServiceProps,
} from '@app/services/types';
import {
  getGraphqlUri,
  // wrapConception,
} from '@app/services/utils';
import { CurrentProject, Identity, Project } from '@app/types';

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

  // get identity() {
  //   return this.#identity as Identity;
  // }

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
        variables: {
          vid: this.projectId,
        },
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

  async getResourceBaseData(): Promise<RbProject> {
    const { data: responseData } = await this.client
      .watchQuery<Query>({
        query: LOAD_PROJECT,
        context: {
          uri: getGraphqlUri(this.projectId),
        },
        fetchPolicy: this.fetchPolicyMod,
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
        fetchPolicy: this.fetchPolicyMod,
      })
      .then(({ data }) => data.project.recentlyEdited);
  }

  trySetupWorkingProject(data: Query) {
    if (ProjectService.isProject(data.project)) {
      // ProjectService.assertRequiredFields(data.project);
      const isTemplateProject = Boolean(
        data.project.resourceBase?.project?.template,
      );
      this.projectMod = isTemplateProject
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
