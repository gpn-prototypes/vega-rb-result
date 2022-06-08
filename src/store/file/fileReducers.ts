import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { FileActions, FileStore, ModalMode } from './fileActions';

export const loaderStoreInitialState: FileStore = {
  status: '',
  websocketId: '',
  downloadArchiveModal: { isClosed: true, allowNotifications: true },
};

export const FileReducers = reducerWithInitialState<FileStore>(
  loaderStoreInitialState,
)
  .case(FileActions.setFileStatus, (state, status: string) => {
    return {
      ...state,
      status,
    };
  })
  .case(FileActions.setWebsocketId, (state, websocketId: string) => {
    return {
      ...state,
      websocketId,
    };
  })

  .case(
    FileActions.setDownloadArchiveModalMode,
    (state, payload: ModalMode) => {
      return {
        ...state,
        downloadArchiveModal: payload,
      };
    },
  );
