import { Histogram } from '@app/generated/graphql';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface HistogramStore {
  payload: Histogram[];
}

const factory = actionCreatorFactory('table');

const actions = {
  setHistograms: factory<HistogramStore>('SET_HISTOGRAMS'),
  resetState: factory('RESET_STATE'),
};

const initialState: HistogramStore = {
  payload: [],
};

const reducer = reducerWithInitialState<HistogramStore>(initialState)
  .case(actions.resetState, () => initialState)
  .case(actions.setHistograms, (state, payload) => ({
    ...state,
    payload: payload.payload,
  }));

export default {
  reducer,
  actions,
};
