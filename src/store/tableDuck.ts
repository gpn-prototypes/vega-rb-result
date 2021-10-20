import { EFluidType } from '@app/constants/Enums';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

const factory = actionCreatorFactory('table');

const actions = {
  initState: factory<GridCollection>('INIT_STATE'),
  resetState: factory('RESET_STATE'),
  exceptionThrew: factory<{ error: string }>('EXCEPTION_THREW'),
  setActiveRow: factory<GridActiveRow | undefined>('SET_ACTIVE_ROW'),
  setSidebarRow: factory<GridActiveRow | undefined>('SET_SIDEBAR_ROW'),
  setFluidType: factory<EFluidType>('SET_FLUID_TYPE'),
  resetActiveRow: factory('RESET_ACTIVE_ROW'),
  resetSidebarRow: factory('RESET_SIDEBAR_ROW'),
};

const initialState: GridCollection = {
  columns: [],
  rows: [],
  version: 0,
  activeRow: undefined,
  sidebarRow: undefined,
  fluidType: EFluidType.ALL,
};

const reducer = reducerWithInitialState<GridCollection>(initialState)
  .case(actions.resetState, () => initialState)
  .case(
    actions.initState,
    (state: GridCollection, payload: GridCollection) => ({
      ...state,
      rows: payload.rows,
      columns: payload.columns,
      version: payload.version,
    }),
  )
  .case(
    actions.setActiveRow,
    (state: GridCollection, payload: GridActiveRow | undefined) => ({
      ...state,
      activeRow: payload,
    }),
  )
  .case(
    actions.setFluidType,
    (state: GridCollection, fluidType: EFluidType) => ({
      ...state,
      fluidType,
    }),
  )
  .case(
    actions.setSidebarRow,
    (state: GridCollection, sidebarRow: GridActiveRow | undefined) => ({
      ...state,
      sidebarRow,
    }),
  )
  .case(actions.resetActiveRow, (state: GridCollection) => ({
    ...state,
    activeRow: undefined,
  }))
  .case(actions.resetSidebarRow, (state: GridCollection) => ({
    ...state,
    sidebarRow: undefined,
  }));

export default {
  reducer,
  actions,
};
