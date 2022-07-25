import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('file');

export type FetchFilePayload = {
  statistics: boolean;
  projectData: boolean;
  samples: boolean;
  plots: boolean;
};

export type FileStore = {
  status: string;
  websocketId: string;
  downloadArchiveModal: ModalMode;
};

export type ModalMode = {
  isClosed: boolean;
  allowNotifications?: boolean;
};

export const FileActions = {
  fetchResultFile: factory<FetchFilePayload>('FETCH_RESULT_FILE'),
  stopFetchingFile: factory('STOP_FETCHING_FILE'),
  fetchResultFileFulfilled: factory('FETCH_FILE_SUCCESS'),
  setFileStatus: factory<string>('SET_FILE_STATUS'),
  setWebsocketId: factory<string>('SET_WEBSOCKET_ID'),
  setDownloadArchiveModalMode: factory<ModalMode>(
    'SET_IS_CLOSED_DOWNLOAD_ARCHIVE_MODAL',
  ),
};
