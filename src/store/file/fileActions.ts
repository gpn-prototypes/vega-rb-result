import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('file');

export type FetchFilePayload = {
  statistics: boolean;
  samples: boolean;
};

export interface FileStore {
  payload: FetchFilePayload;
}

export const fileStoreInitialState: FileStore = {
  payload: {} as FetchFilePayload,
};

export const FileAction = {
  fetchResultFile: factory<FetchFilePayload>('FETCH_RESULT_FILE'),
  stopFetchingFile: factory('STOP_FETCHING_FILE'),
  fetchResultFileFulfilled: factory('FETCH_FILE_SUCCESS'),
};
