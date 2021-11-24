import { Histogram, HistogramStatistic } from '@app/generated/graphql';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface HistogramStore {
  payload: Histogram[];
  statistics: HistogramStatistic[];
}

const factory = actionCreatorFactory('table');

const actions = {
  setHistograms: factory<Histogram[]>('SET_HISTOGRAMS'),
  setStatistics: factory<HistogramStatistic[]>('SET_STATISTICS'),
  resetState: factory('RESET_STATE'),
};

const initialState: HistogramStore = {
  payload: [],
  statistics: [],
};

const reducer = reducerWithInitialState<HistogramStore>(initialState)
  .case(actions.resetState, () => initialState)
  .case(actions.setHistograms, (state, payload) => ({
    ...state,
    payload,
  }))
  .case(actions.setStatistics, (state, payload) => ({
    ...state,
    statistics: payload,
  }));

export default {
  reducer,
  actions,
};
