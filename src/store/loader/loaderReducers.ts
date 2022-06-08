import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { LoaderActions, LoaderStore, LoadingType } from './loaderActions';

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
  .case(LoaderActions.setLoading, (state, type: LoadingType) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = false;
    cloneState.loading[type] = true;

    return cloneState;
  })
  .case(LoaderActions.setLoaded, (state, type: LoadingType) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = true;
    cloneState.loading[type] = false;

    return cloneState;
  })
  .case(LoaderActions.resetType, (state, type: LoadingType) => {
    const cloneState = { ...state };

    cloneState.loaded[type] = false;
    cloneState.loading[type] = false;

    return cloneState;
  })
  .case(LoaderActions.resetStore, () => {
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
