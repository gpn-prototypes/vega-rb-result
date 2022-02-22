import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('file');

export type FetchFilePayload = {
  statistics: boolean;
  samples: boolean;
  plots: boolean;
};

export type FileStore = {
  status: string;
  websocketId: string;
};

export const FileAction = {
  fetchResultFile: factory<FetchFilePayload>('FETCH_RESULT_FILE'),
  stopFetchingFile: factory('STOP_FETCHING_FILE'),
  fetchResultFileFulfilled: factory('FETCH_FILE_SUCCESS'),
  setFileStatus: factory<string>('FILE/SET_FILE_STATUS'),
  setWebsocketId: factory<string>('FILE/SET_WEBSOCKET_ID'),
};
