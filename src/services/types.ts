import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  ProjectStructure,
  ResultProjectStructure,
} from '@app/generated/graphql';
import { CurrentProject, Identity } from '@app/types';

export type ProjectServiceProps = {
  client: ApolloClient<NormalizedCacheObject>;
  project: CurrentProject;
  identity?: Identity;
};

export type CachedProjectData = {
  version: number;
  structure: ProjectStructure;
};

export type CalculationResponse = { filename: string; data: Blob };

export interface DomainObjectsDelta {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IProjectService {
  abortController: AbortController;

  version: number;

  projectId: string;

  init(initialProps: ProjectServiceProps): IProjectService;

  getStructure(): Promise<ProjectStructure>;

  getTableTemplate(): Promise<ProjectStructure>;

  getProjectName(): Promise<string>;

  getResourceBaseData(): Promise<ResultProjectStructure>;

  generateCalculationResultArchiveProcessId(
    statistics: boolean,
    projectData: boolean,
    samples: boolean,
    plots: boolean,
  ): Promise<string>;
}
