import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { LoaderAction, LoaderStore, LoadingType } from './loaderActions';

export const loaderStoreInitialState: LoaderStore = Object.freeze({
  loaded: {
    'file': false,
    'histogram': false,
    'histogram-statistic': false,
    'decimal': false,
    'table': false,
  },
  loading: {
    'file': false,
    'histogram': true,
    'histogram-statistic': false,
    'decimal': false,
    'table': true,
  },
});

export const LoaderReducers = reducerWithInitialState<LoaderStore>(
  loaderStoreInitialState,
)
  .case(LoaderAction.setLoading, (state, type: LoadingType) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = false;
    cloneState.loading[type] = true;

    return cloneState;
  })
  .case(LoaderAction.setLoaded, (state, type: LoadingType) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = true;
    cloneState.loading[type] = false;

    return cloneState;
  })
  .case(LoaderAction.resetType, (state, type: LoadingType) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = false;
    cloneState.loading[type] = false;

    return cloneState;
  })
  .case(LoaderAction.resetStore, () => {
    return {
      loaded: {
        'file': false,
        'histogram': false,
        'histogram-statistic': false,
        'decimal': false,
        'table': false,
      },
      loading: {
        'file': false,
        'histogram': true,
        'histogram-statistic': false,
        'decimal': false,
        'table': true,
      },
    };
  });
