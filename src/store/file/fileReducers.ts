import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { FileAction, FileStore, fileStoreInitialState } from './fileActions';

export const FileReducers = reducerWithInitialState<FileStore>(
  fileStoreInitialState,
)
  .case(FileAction.fetchResultFile, (state: FileStore) => {
    return {
      ...state,
    };
  })
  .case(FileAction.fetchResultFileFulfilled, (state: FileStore) => {
    return {
      ...state,
    };
  })
  .case(FileAction.stopFetchingFile, (state: FileStore) => {
    return {
      ...state,
    };
  });
