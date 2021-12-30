import {
  Column,
  RowEntity,
} from '@app/components/TableResultRbController/TableResultRb/types';
import { EFluidType } from '@app/constants/Enums';
import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';
import { RbDomainEntityInput } from '@app/generated/graphql';
import {
  DecimalFixed,
  GridActiveRow,
  GridCollection,
  HiddenColumns,
} from '@app/types/typesTable';
import { LocalStorageHelper } from '@app/utils/LocalStorageHelper';
import { MathHelper } from '@app/utils/MathHelper';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import {
  TableActions,
  TableSetDecimalFixedActionPayload,
} from './tableActions';

const decimalFromLocalStorage: DecimalFixed | null =
  LocalStorageHelper.getParsed<DecimalFixed>(LocalStorageKey.DecimalFixed);

const hiddenColumnsFromLocalStorage: HiddenColumns | null =
  LocalStorageHelper.getParsed<HiddenColumns>(LocalStorageKey.HiddenColumns);

export const DEFAULT_DECIMAL_FIXED = 3;

export const getHiddenColumns = (): HiddenColumns => {
  return Object.keys(hiddenColumnsFromLocalStorage).length !== 0
    ? hiddenColumnsFromLocalStorage
    : {
        PERCENTILE: true,
        GCOS: true,
      };
};

export const tableInitialState: GridCollection = {
  columns: [],
  actualColumns: [],
  rows: [],
  version: 0,
  activeRow: undefined,
  sidebarRow: undefined,
  fluidType: EFluidType.ALL,
  decimalFixed: decimalFromLocalStorage !== null ? decimalFromLocalStorage : {},
  hiddenColumns: getHiddenColumns(),
  entitiesCount: 0,
};

export const getDecimalByColumns = (
  columns: Column<RbDomainEntityInput>[],
): DecimalFixed => {
  const decimalFixed: DecimalFixed = {};

  columns
    .filter(
      (column: Column<RbDomainEntityInput>) => column.decimal !== undefined,
    )
    .forEach((column: Column<RbDomainEntityInput>) => {
      decimalFixed[column.accessor] =
        column.decimal !== undefined ? column.decimal : DEFAULT_DECIMAL_FIXED;
    });

  return decimalFixed;
};

export const getDecimalRows = (
  rows: RowEntity[],
  columns: Column<RbDomainEntityInput>[],
  decimalFixed: DecimalFixed = tableInitialState.decimalFixed || {},
): RowEntity[] => {
  const resultRows = [...rows].map((row: RowEntity) => {
    const decimalRow = {};

    Object.keys(row).forEach((rowKey: string) => {
      decimalRow[rowKey] = row[rowKey];

      const { value } = row[rowKey];

      if (!value) {
        return;
      }

      const decimalFromStorage =
        decimalFixed[rowKey] < 0 ? 0 : decimalFixed[rowKey];

      const decimal =
        decimalFixed[rowKey] || decimalFixed[rowKey] === 0
          ? decimalFromStorage
          : getDecimalByColumns(columns)[rowKey];

      // eslint-disable-next-line no-restricted-globals
      decimalRow[rowKey].formattedValue = isNaN(Number(value))
        ? value
        : MathHelper.getNormalizerFixed(decimal, Number(value));
    });

    return decimalRow as RowEntity;
  });

  return resultRows;
};

export const getActualColumns = (
  state: GridCollection,
  payload: HiddenColumns = hiddenColumnsFromLocalStorage,
): Column<RbDomainEntityInput>[] => {
  const findColumnByAccessor = (
    accessor: string,
  ): Column<RbDomainEntityInput> | undefined => {
    const found = state.columns.find(
      (column: Column<RbDomainEntityInput>) => column.accessor === accessor,
    );

    if (found === undefined) {
      return undefined;
    }

    return found;
  };

  let actualColumns = [...state.columns];

  Object.keys(payload).forEach((key: string) => {
    if (payload[key] === true) {
      const hiddenColumnsGroup = findColumnByAccessor(key)?.columnAccessorGroup;

      actualColumns = actualColumns.filter(
        (column: Column<RbDomainEntityInput>) => {
          return !hiddenColumnsGroup?.includes(column.accessor);
        },
      );
    }
  });

  return actualColumns;
};

export const TableReducers = reducerWithInitialState<GridCollection>(
  tableInitialState,
)
  .case(TableActions.resetState, () => tableInitialState)
  .case(
    TableActions.initState,
    (state: GridCollection, payload: GridCollection) => {
      const initialHidenColumns = getHiddenColumns();

      return {
        ...state,
        rows: payload.rows,
        columns: payload.columns,
        actualColumns: getActualColumns(payload, initialHidenColumns),
        version: payload.version,
      };
    },
  )
  .case(
    TableActions.setActiveRow,
    (state: GridCollection, payload: GridActiveRow | undefined) => ({
      ...state,
      activeRow: payload,
    }),
  )
  .case(
    TableActions.setFluidType,
    (state: GridCollection, fluidType: EFluidType) => ({
      ...state,
      fluidType,
    }),
  )
  .case(
    TableActions.setSidebarRow,
    (state: GridCollection, sidebarRow: GridActiveRow | undefined) => ({
      ...state,
      sidebarRow,
    }),
  )
  .case(TableActions.resetActiveRow, (state: GridCollection) => ({
    ...state,
    activeRow: undefined,
  }))
  .case(TableActions.resetSidebarRow, (state: GridCollection) => ({
    ...state,
    sidebarRow: undefined,
  }))
  .case(
    TableActions.setDecimalFixed,
    (state: GridCollection, payload: TableSetDecimalFixedActionPayload) => {
      const decimalFixed = LocalStorageHelper.getParsed<DecimalFixed>(
        LocalStorageKey.DecimalFixed,
      );

      /** Получаем из localstorage, либо из данных таблицы */
      const value =
        decimalFixed[payload.columnCode] !== undefined
          ? decimalFixed[payload.columnCode]
          : getDecimalByColumns(state.columns)[payload.columnCode];

      decimalFixed[payload.columnCode] =
        payload.type === 'plus' ? value + 1 : value - 1;

      LocalStorageHelper.setParsed<DecimalFixed>(
        LocalStorageKey.DecimalFixed,
        decimalFixed,
      );

      return {
        ...state,
        decimalFixed,
        rows: getDecimalRows(state.rows, state.columns, decimalFixed),
      };
    },
  )
  .case(
    TableActions.setHiddenColumns,
    (state: GridCollection, payload: HiddenColumns) => {
      LocalStorageHelper.setParsed<HiddenColumns>(
        LocalStorageKey.HiddenColumns,
        payload,
      );

      return {
        ...state,
        actualColumns: getActualColumns(state, payload),
        hiddenColumns: payload,
      };
    },
  )
  .case(
    TableActions.setEntitiesCount,
    (state: GridCollection, payload: number) => {
      return {
        ...state,
        entitiesCount: payload,
      };
    },
  );
