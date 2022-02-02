import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('file');

export type FetchFilePayload = {
  // TODO ? move
  statistics: boolean;
  samples: boolean;
};

export const FileAction = {
  fetchResultFile: factory<FetchFilePayload>('FETCH_RESULT_FILE'),
  stopFetchingFile: factory('STOP_FETCHING_FILE'),
  fetchResultFileFulfilled: factory('FETCH_FILE_SUCCESS'),
};
