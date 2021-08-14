import {
  ApolloClient,
  FetchResult,
  NormalizedCacheObject,
} from '@apollo/client';
import { DistributionChartData } from 'components/DistributionSettings/types';
import { GridCollection } from 'components/ExcelTable/types';
import {
  CommonError,
  DistributionDefinitionError,
  Error,
  ProjectStructure,
  RbProject,
  ValidationError,
} from '@app/generated/graphql';
import { CurrentProject, Identity } from '@app/types';

export interface DistributionResponse {
  distributionChart?: DistributionChartData;
  errors?: DistributionDefinitionError[];
}

export type DistributionError = DistributionDefinitionError | CommonError;

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

  calculationSettings: CalculationSettings;

  init(initialProps: ProjectServiceProps): IProjectService;

  getStructure(): Promise<ProjectStructure>;

  saveProject(table: GridCollection): Promise<FetchResult>;

  getTableTemplate(): Promise<ProjectStructure>;

  getCalculationArchive(fileId: string): Promise<CalculationResponse>;

  getCalculationSettings(): Promise<void>;

  saveCalculationSettings(
    data: CalculationSettings,
  ): Promise<Error | ValidationError | null>;

  getProjectName(): Promise<string>;

  getResourceBaseData(): Promise<RbProject>;

  getCachedRbData(): Promise<CachedProjectData>;
}
