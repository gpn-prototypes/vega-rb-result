import { EFluidType } from '@app/constants/Enums';
import {
  DecimalFixed,
  GridActiveRow,
  GridCollection,
  HiddenColumns,
} from '@app/types/typesTable';
import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('table');

export type TableSetDecimalFixedActionPayload = {
  type: 'plus' | 'minus';
  columnCode: string;
};

export const TableActions = {
  initState: factory<GridCollection>('INIT_STATE'),
  resetState: factory('RESET_STATE'),
  initLoadTable: factory('INIT_LOAD_TABLE'),
  exceptionThrew: factory<{ error: string }>('EXCEPTION_THREW'),
  setActiveRow: factory<GridActiveRow | undefined>('SET_ACTIVE_ROW'),
  setSidebarRow: factory<GridActiveRow | undefined>('SET_SIDEBAR_ROW'),
  setFluidType: factory<EFluidType>('SET_FLUID_TYPE'),
  resetActiveRow: factory('RESET_ACTIVE_ROW'),
  resetSidebarRow: factory('RESET_SIDEBAR_ROW'),
  initUpdateDecimalFixed: factory<TableSetDecimalFixedActionPayload>(
    'INIT_UPDATE_DECIMAL_FIXED',
  ),
  setDecimalFixed: factory<DecimalFixed>('SET_DECIMAL_FIXED'),
  setHiddenColumns: factory<HiddenColumns>('SET_HIDDEN_COLUMNS'),
  setEntitiesCount: factory<number>('SET_ENTITIES_COUNT'),
  setNotFound: factory<boolean>('SET_NOT_FOUND'),
  updateDecimal: factory('UPDATE_DECIMAL'),
};
