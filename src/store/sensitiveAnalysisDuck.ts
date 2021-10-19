import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface SensitiveAnalysisStore {
  payload: SensitiveAnalysis | undefined;
}

const factory = actionCreatorFactory('sensitiveAnalysis');

const actions = {
  setSensitiveAnalysis: factory<SensitiveAnalysisStore>(
    'SET_SENSITIVE_ANALYSIS',
  ),
  resetState: factory('RESET_STATE'),
};

const initialState: SensitiveAnalysisStore = {
  payload: undefined,
};

const reducer = reducerWithInitialState<SensitiveAnalysisStore>(initialState)
  .case(actions.resetState, () => initialState)
  .case(
    actions.setSensitiveAnalysis,
    (state: SensitiveAnalysisStore, payload: SensitiveAnalysisStore) => ({
      ...state,
      payload: payload.payload,
    }),
  );

export default {
  reducer,
  actions,
};
