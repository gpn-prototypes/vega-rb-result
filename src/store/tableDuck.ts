import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { GridCollection } from "@app/types/typesTable";

const factory = actionCreatorFactory('table');

const actions = {
  initState: factory<GridCollection>('INIT_STATE'),
  resetState: factory('RESET_STATE'),
  exceptionThrew: factory<{ error: string }>('EXCEPTION_THREW'),
};

const initialState: GridCollection = {
  columns: [],
  rows: [],
  version: 0,
};

const reducer = reducerWithInitialState<GridCollection>(initialState)
  .case(actions.resetState, () => initialState)
  .case(actions.initState, (state, payload) => ({
    ...state,
    rows: payload.rows,
    columns: payload.columns,
    version: payload.version,
  }));

export default {
  reducer,
  actions,
};
