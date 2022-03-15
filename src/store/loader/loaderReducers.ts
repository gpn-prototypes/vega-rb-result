import { reducerWithInitialState } from 'typescript-fsa-reducers';

import {
  LoaderAction,
  LoaderStore,
  LoadingKeyValue,
  LoadingType,
} from './loaderActions';

export const loaderStoreInitialState: LoaderStore = {
  loaded: {
    'file': false,
    'histogram': false,
    'histogram-statistic': false,
    'table': false,
  },
  loading: {
    'file': false,
    'histogram': false,
    'histogram-statistic': false,
    'table': true,
  },
};

export const LoaderReducers = reducerWithInitialState<LoaderStore>(
  loaderStoreInitialState,
)
  .case(LoaderAction.setLoading, (state, type: LoadingType) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = false;
    cloneState.loading[type] = true;

    return cloneState;
  })
  .case(LoaderAction.setLoaded, (state, type) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = true;
    cloneState.loading[type] = false;

    return cloneState;
  })
  .case(LoaderAction.resetStore, () => {
    return {
      loaded: {} as LoadingKeyValue,
      loading: {} as LoadingKeyValue,
    };
  });
