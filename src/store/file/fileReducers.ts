import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { FileAction } from './fileActions';

export const FileReducers = reducerWithInitialState<any>( // TODO ? <LoaderStore>
  // loaderStoreInitialState,
  {},
)
  .case(FileAction.fetchResultFile, (state: any) => {
    // TODO ? any
    return {
      ...state,
    };
  })
  .case(FileAction.fetchResultFileFulfilled, (state: any) => {
    // TODO ? any
    return {
      ...state,
    };
  })
  .case(FileAction.stopFetchingFile, (state: any) => {
    // TODO ? any
    return {
      ...state,
      file: undefined,
    };
  });
