import { EFluidType } from '@app/constants/Enums';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('table');

export const TableActions = {
  initState: factory<GridCollection>('INIT_STATE'),
  resetState: factory('RESET_STATE'),
  exceptionThrew: factory<{ error: string }>('EXCEPTION_THREW'),
  setActiveRow: factory<GridActiveRow | undefined>('SET_ACTIVE_ROW'),
  setSidebarRow: factory<GridActiveRow | undefined>('SET_SIDEBAR_ROW'),
  setFluidType: factory<EFluidType>('SET_FLUID_TYPE'),
  resetActiveRow: factory('RESET_ACTIVE_ROW'),
  resetSidebarRow: factory('RESET_SIDEBAR_ROW'),
  setDecimalFixed: factory<number>('SET_DECIMAL_FIXED'),
};
