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
  initState: factory<GridCollection>('TABLE/INIT_STATE'),
  resetState: factory('TABLE/RESET_STATE'),
  initLoadTable: factory('TABLE/INIT_LOAD_TABLE'),
  exceptionThrew: factory<{ error: string }>('TABLE/EXCEPTION_THREW'),
  setActiveRow: factory<GridActiveRow | undefined>('TABLE/SET_ACTIVE_ROW'),
  setSidebarRow: factory<GridActiveRow | undefined>('TABLE/SET_SIDEBAR_ROW'),
  setFluidType: factory<EFluidType>('TABLE/SET_FLUID_TYPE'),
  resetActiveRow: factory('TABLE/RESET_ACTIVE_ROW'),
  resetSidebarRow: factory('TABLE/RESET_SIDEBAR_ROW'),
  initUpdateDecimalFixed: factory<TableSetDecimalFixedActionPayload>(
    'TABLE/INIT_UPDATE_DECIMAL_FIXED',
  ),
  setDecimalFixed: factory<DecimalFixed>('TABLE/SET_DECIMAL_FIXED'),
  setHiddenColumns: factory<HiddenColumns>('TABLE/SET_HIDDEN_COLUMNS'),
  setEntitiesCount: factory<number>('TABLE/SET_ENTITIES_COUNT'),
  setNotFound: factory<boolean>('TABLE/SET_NOT_FOUND'),
  updateDecimal: factory('TABLE/UPDATE_DECIMAL'),
};
