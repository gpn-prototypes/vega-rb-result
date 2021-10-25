import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface SensitiveAnalysisStore {
  payload: SensitiveAnalysis | undefined;
  statistic: SensitiveAnalysis | undefined;
}

const factory = actionCreatorFactory('sensitiveAnalysis');

const actions = {
  setSensitiveAnalysis: factory<SensitiveAnalysis>('SET_SENSITIVE_ANALYSIS'),
  setSensitiveAnalysisStatistic: factory<SensitiveAnalysis>(
    'SET_SENSITIVE_ANALYSIS_STATISTIC',
  ),
  resetState: factory('RESET_STATE'),
};

const initialState: SensitiveAnalysisStore = {
  payload: undefined,
  statistic: undefined,
};

const reducer = reducerWithInitialState<SensitiveAnalysisStore>(initialState)
  .case(actions.resetState, () => initialState)
  .case(
    actions.setSensitiveAnalysis,
    (state: SensitiveAnalysisStore, payload: SensitiveAnalysis) => ({
      ...state,
      payload,
    }),
  )
  .case(
    actions.setSensitiveAnalysisStatistic,
    (state: SensitiveAnalysisStore, statistic: SensitiveAnalysis) => ({
      ...state,
      statistic,
    }),
  );

export default {
  reducer,
  actions,
};
