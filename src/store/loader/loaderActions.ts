import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('loader');

export type LoadingType =
  | 'file'
  | 'histogram'
  | 'histogram-statistic'
  | 'decimal'
  | 'table';

export type LoadingState = {
  key: LoadingType;
  value: boolean;
};
export type LoadingKeyValue = Record<LoadingType, boolean>;

export interface LoaderStore {
  loaded: LoadingKeyValue;
  loading: LoadingKeyValue;
}

export const LoaderActions = {
  setLoaded: factory<LoadingType>('SET_LOADED'),
  setLoading: factory<LoadingType>('SET_LOADING'),
  resetStore: factory('RESET_STORE'),
  resetType: factory<LoadingType>('RESET_TYPE'),
};
