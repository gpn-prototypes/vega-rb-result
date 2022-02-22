import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { FileAction, FileStore } from './fileActions';

export const loaderStoreInitialState: FileStore = {
  status: '',
  websocketId: '',
};

export const FileReducers = reducerWithInitialState<FileStore>(
  loaderStoreInitialState,
)
  .case(FileAction.setFileStatus, (state, status: string) => {
    return {
      ...state,
      status,
    };
  })
  .case(FileAction.setWebsocketId, (state, websocketId: string) => {
    return {
      ...state,
      websocketId,
    };
  });
