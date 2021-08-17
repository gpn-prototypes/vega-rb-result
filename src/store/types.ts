import { Param } from '@app/model/Param';
import { IProjectService } from '@app/services/types';

export interface CompetitiveAccess {
  isRecentlyEdited: boolean;
}

export interface AlertState {
  text: string;
  loaderText: string;
  errorText: string;
}
export interface TreeFilter {
  rowsIdx: number[];
  columnKeys: string[];
}

export interface TreeState {
  filter: TreeFilter;
}

export interface ProjectState {
  params: Param[];
  name: string;
}
export interface NormalizedState<T> {
  ids: string[];
  byId: {
    [id: string]: T;
  };
}

export type ErrorsState = NormalizedState<any>;

export interface RootState {
  alert: AlertState;
  project: ProjectState;
  table: any;
  tree: TreeState;
  competitiveAccess: CompetitiveAccess;
  errors: ErrorsState;
}

export type TypedColumnsList = {
  columns: any[];
  type: any;
};

export type NormalizedErrors = {
  errors: any;
  id: string;
};

export type RemovableError = {
  id: string;
  path: (string | number)[];
};

export type EpicDependencies = {
  projectService: IProjectService;
};
