import {
  ApolloClient,
  NormalizedCacheObject,
} from '@apollo/client';
import {
  ProjectStructure,
  RbProject,
} from '@app/generated/graphql';
import { CurrentProject, Identity } from '@app/types';

export type ProjectServiceProps = {
  client: ApolloClient<NormalizedCacheObject>;
  project: CurrentProject;
  identity?: Identity;
};

export type CalculationResponse = { filename: string; data: Blob };

export type CalculationSettings = {
  method: string | null;
  iterationNumber: number | null;
  percentiles: string[] | null;
};

export type CachedProjectData = {
  version: number;
  structure: ProjectStructure;
};

export interface DomainObjectsDelta {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IProjectService {
  abortController: AbortController;

  version: number;

  init(initialProps: ProjectServiceProps): IProjectService;

  getStructure(): Promise<ProjectStructure>;

  getTableTemplate(): Promise<ProjectStructure>;

  getCalculationArchive(fileId: string): Promise<CalculationResponse>;

  getCalculationSettings(): Promise<void>;

  getProjectName(): Promise<string>;

  getResourceBaseData(): Promise<RbProject>;

  getCachedRbData(): Promise<CachedProjectData>;
}
