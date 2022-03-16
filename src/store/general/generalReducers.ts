import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { GeneralStore } from '../types';

import { GeneralActions } from './generalActions';

export const generalInitialState: GeneralStore = {
  notFound: false,
};

export const GeneralReducers = reducerWithInitialState<GeneralStore>(
  generalInitialState,
).case(GeneralActions.resetState, () => generalInitialState);
