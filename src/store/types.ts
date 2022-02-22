import { Param } from '@app/model/Param';
import { IProjectService } from '@app/services/types';
import { GridCollection } from '@app/types/typesTable';
import { History } from 'history';
import { AnyAction, Dispatch } from 'redux';

import { FileStore } from './file/fileActions';
import { LoaderStore } from './loader/loaderActions';
import { NotifyStore } from './notify/notifyActions';
import { SettingStore } from './settings/settingsActions';
import { WebsocketStore } from './websocket/websocketActions';
import { HistogramStore } from './histogramDuck';
import { SensitiveAnalysisStore } from './sensitiveAnalysisDuck';

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

export type GeneralStore = {
  notFound: boolean;
};

export interface RootState {
  alert: AlertState;
  project: ProjectState;
  table: GridCollection;
  tree: TreeState;
  competitiveAccess: CompetitiveAccess;
  errors: ErrorsState;
  histograms: HistogramStore;
  sensitiveAnalysis: SensitiveAnalysisStore;
  settings: SettingStore;
  notify: NotifyStore;
  websocket: WebsocketStore;
  general: GeneralStore;
  loader: LoaderStore;
  file: FileStore;
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

export type StoreDependencies = {
  projectService: IProjectService;
  history: History;
  dispatch: Dispatch<AnyAction>;
};
