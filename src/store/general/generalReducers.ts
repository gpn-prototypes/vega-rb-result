import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { GeneralStore } from '../types';

import { GeneralActions } from './generalActions';

export const generalInitialState: GeneralStore = {
  notFound: false,
};

export const GeneralReducers = reducerWithInitialState<GeneralStore>(
  generalInitialState,
)
  .case(GeneralActions.setNotFound, (state: GeneralStore, payload: boolean) => {
    return {
      ...state,
      notFound: payload,
    };
  })
  .case(GeneralActions.resetState, () => generalInitialState);
