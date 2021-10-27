import { Row } from '@app/components/TableResultRbController/TableResultRb/types';
import { EFluidType } from '@app/constants/Enums';
import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';
import { RbDomainEntityInput } from '@app/generated/graphql';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { LocalStorageHelper } from '@app/utils/LocalStorageHelper';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { TableActions } from './tableActions';

const decimalFromLocalStorage: string | null = LocalStorageHelper.get(
  LocalStorageKey.DecimalFixed,
);

export const tableInitialState: GridCollection = {
  columns: [],
  rows: [],
  version: 0,
  activeRow: undefined,
  sidebarRow: undefined,
  fluidType: EFluidType.ALL,
  decimalFixed:
    decimalFromLocalStorage !== null ? Number(decimalFromLocalStorage) : 3,
};

export const getDecimalRows = (
  rows: Row<RbDomainEntityInput>[],
  decimalFixed: number = tableInitialState.decimalFixed || 3,
): Row<RbDomainEntityInput>[] => {
  const resultRows = [...rows].map((row: Row<RbDomainEntityInput>) => {
    const decimalColumn = {};

    Object.keys(row).forEach((rowKey: string) => {
      decimalColumn[rowKey] = row[rowKey];

      const { value } = row[rowKey];

      if (!value) {
        return;
      }

      // eslint-disable-next-line no-restricted-globals
      decimalColumn[rowKey].formattedValue = isNaN(value)
        ? value
        : Number(value).toFixed(decimalFixed).toString();
    });

    return decimalColumn as Row<RbDomainEntityInput>;
  });

  return resultRows;
};

export const TableReducers = reducerWithInitialState<GridCollection>(
  tableInitialState,
)
  .case(TableActions.resetState, () => tableInitialState)
  .case(
    TableActions.initState,
    (state: GridCollection, payload: GridCollection) => ({
      ...state,
      rows: payload.rows,
      columns: payload.columns,
      version: payload.version,
    }),
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
    (state: GridCollection, decimalFixed: number) => {
      LocalStorageHelper.set(
        LocalStorageKey.DecimalFixed,
        decimalFixed.toString(),
      );

      return {
        ...state,
        decimalFixed,
        rows: getDecimalRows(state.rows, decimalFixed),
      };
    },
  );
