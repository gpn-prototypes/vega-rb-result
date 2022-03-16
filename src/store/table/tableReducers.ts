import {
  Column,
  RowEntity,
} from '@app/components/TableResultRbController/TableResultRb/types';
import { EFluidType } from '@app/constants/Enums';
import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';
import {
  DecimalFixed,
  GridActiveRow,
  GridCollection,
  HiddenColumns,
} from '@app/types/typesTable';
import { LocalStorageHelper } from '@app/utils/LocalStorageHelper';
import { MathHelper } from '@app/utils/MathHelper';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { TableActions } from './tableActions';

const hiddenColumnsFromLocalStorage: HiddenColumns | null =
  LocalStorageHelper.getParsed<HiddenColumns>(LocalStorageKey.HiddenColumns);

export const getHiddenColumns = (): HiddenColumns => {
  return Object.keys(hiddenColumnsFromLocalStorage).length !== 0
    ? hiddenColumnsFromLocalStorage
    : {
        PERCENTILE: true,
        GCOS: true,
      };
};

export const getDecimalByColumns = (
  columns: Column[],
  accessor: string,
): number | undefined => {
  return columns.find((column: Column) => column.accessor === accessor)
    ?.decimal;
};

export const tableInitialState: GridCollection = {
  columns: [],
  actualColumns: [],
  rows: [],
  version: 0,
  activeRow: undefined,
  sidebarRow: undefined,
  fluidType: EFluidType.ALL,
  decimalFixed: {} as DecimalFixed,
  hiddenColumns: getHiddenColumns(),
  entitiesCount: 0,
  notFound: false,
};

export const getDecimalRows = (
  rows: RowEntity[],
  columns: Column[],
  decimalFixed: DecimalFixed,
): RowEntity[] => {
  const resultRows = [...rows].map((row: RowEntity) => {
    const decimalRow = {};

    Object.keys(row).forEach((rowKey: string) => {
      decimalRow[rowKey] = row[rowKey];

      const { value } = row[rowKey];

      if (!value) {
        return;
      }

      const decimal =
        decimalFixed[rowKey] === undefined
          ? getDecimalByColumns(columns, rowKey)
          : decimalFixed[rowKey];

      decimalRow[rowKey].formattedValue =
        // eslint-disable-next-line no-restricted-globals
        decimal === undefined || isNaN(Number(value))
          ? value
          : MathHelper.getNormalizerFixed(decimal, Number(value));
    });

    return decimalRow as RowEntity;
  });

  return resultRows;
};

export const getActualColumns = (
  columns: Column[],
  payload: HiddenColumns = hiddenColumnsFromLocalStorage,
): Column[] => {
  const findColumnByAccessor = (accessor: string): Column | undefined => {
    const found = columns.find(
      (column: Column) => column.accessor === accessor,
    );

    if (found === undefined) {
      return undefined;
    }

    return found;
  };

  let actualColumns = [...columns];

  Object.keys(payload).forEach((key: string) => {
    if (payload[key] === true) {
      const hiddenColumnsGroup = findColumnByAccessor(key)?.columnAccessorGroup;

      actualColumns = actualColumns.filter((column: Column) => {
        return !hiddenColumnsGroup?.includes(column.accessor);
      });
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
      return {
        ...state,
        rows: payload.rows,
        columns: payload.columns,
        actualColumns: payload.actualColumns,
        version: payload.version,
        decimalFixed: payload.decimalFixed,
        notFound: payload.notFound,
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
    TableActions.setNotFound,
    (state: GridCollection, notFound: boolean) => ({
      ...state,
      ...{
        notFound,
      },
    }),
  )
  .case(TableActions.updateDecimal, (state: GridCollection) => {
    const { decimalFixed } = state;

    return {
      ...state,
      rows: getDecimalRows(state.rows, state.columns, decimalFixed),
    };
  })
  .case(
    TableActions.setDecimalFixed,
    (state: GridCollection, decimalFixed: DecimalFixed) => {
      return {
        ...state,
        ...{ decimalFixed },
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
        actualColumns: getActualColumns(state.columns, payload),
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
