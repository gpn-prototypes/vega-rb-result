import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader, useMount } from '@gpn-prototypes/vega-ui';
import { useGetError } from '@app/hooks';
import { flow, set, uniq } from 'lodash/fp';
import { loadTableData } from '@app/services/loadTableData';
import tableDuck from '@app/store/tableDuck';
import treeFilterDuck from '@app/store/treeDuck';
import { RootState } from '@app/store/types';
import { rowIsFulfilled } from '@app/utils/rowIsFullFilled';
import {TableResultRb} from "@app/components/TableResultRbController/TableResultRb/TableResultRb";
import {GridColumn, GridRow, OnRowClickArgs, RowsToUpdate, SelectedCell} from "@app/types/typesTable";
import {TableEntities} from "@app/types/enumsTable";
import {Nullable} from "@app/types";

interface IProps {
  onSelect?: (data: Nullable<SelectedCell>) => void;
}

export const Table: React.FC<IProps> = ({ onSelect = (): void => {} }) => {
  const dispatch = useDispatch();
  const reduxTableData = useSelector(({ table }: RootState) => table);

  const { rowsIdx, columnKeys } = useSelector(
    ({ tree }: RootState) => tree.filter,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [, errors] = useGetError();
  const isTreeFilterActive = Boolean(rowsIdx.length && columnKeys.length);

  const filteredDataKeys = useMemo(() => {
    if (isTreeFilterActive) {
      const visibleRowsKeys = reduxTableData.rows
        .filter(
          (row, idx) =>
            rowsIdx.includes(idx) ||
            !rowIsFulfilled(row, reduxTableData.columns),
        )
        .map((row) => row.key!.value as string);

      const visibleColumnsKeys = reduxTableData.columns
        .map((column) => column.key)
        .filter((key) => !columnKeys.includes(key));

      return { columnsKeys: visibleColumnsKeys, rowsKeys: visibleRowsKeys };
    }

    return {
      columnsKeys: reduxTableData.columns.map((column) => column.key),
      rowsKeys: reduxTableData.rows.map((row) => row.key!.value as string),
    };
  }, [
    isTreeFilterActive,
    reduxTableData.columns,
    reduxTableData.rows,
    rowsIdx,
    columnKeys,
  ]);

  const getNewRows = (
    rows: GridRow[],
    updatedRows: GridRow[],
    keys: string[],
    parentRowKey: string,
    isFilterActive: boolean,
  ) => {
    const tableRows = reduxTableData.rows;

    return rows.map((row) => {
      const parentRowsIdx = tableRows.findIndex(
        (parentRow) => parentRow.key!.value === parentRowKey,
      );

      const updateRowIdx = updatedRows.findIndex(
        (updatedRow: GridRow) => updatedRow.key!.value === row.key!.value,
      );

      if (updateRowIdx !== -1) {
        return isFilterActive && parentRowsIdx !== -1
          ? flow(
            ...keys.map((key) => set([key], tableRows[parentRowsIdx][key])),
          )(updatedRows[updateRowIdx])
          : updatedRows[updateRowIdx];
      }

      return row;
    });
  };

  const handleSetRows = (
    data: GridRow[],
    rowsToUpdate?: RowsToUpdate,
  ): void => {
    const updatedRows = data.filter((value) =>
      rowsToUpdate?.rowsKeys?.includes(value.key!.value as string),
    );

    const parentRowKey =
      rowsIdx[0] !== undefined && rowsIdx[0] !== undefined
        ? (reduxTableData.rows[rowsIdx[0]]?.key!.value as string)
        : '';

    const newRows = getNewRows(
      data,
      updatedRows,
      columnKeys,
      parentRowKey,
      isTreeFilterActive,
    );

    dispatch(tableDuck.actions.updateRows(newRows));

    if (isTreeFilterActive) {
      const ids = reduxTableData.rows.reduce<number[]>((prev, curr, idx) => {
        const item = updatedRows.find(
          (updatedRow: GridRow) => updatedRow.id === curr.id,
        );

        if (item) {
          return [...prev, idx];
        }

        return prev;
      }, []);

      dispatch(
        treeFilterDuck.actions.setFilter({
          columnKeys,
          rowsIdx: uniq([...rowsIdx, ...ids]),
        }),
      );
    }
  };

  const handleSetColumns = (data: GridColumn[]): void => {
    dispatch(tableDuck.actions.updateColumns(data));
  };

  const handleRowClick = ({ rowIdx, row, column }: OnRowClickArgs): void => {
    if (column.type === TableEntities.CALC_PARAM) {
      onSelect({ rowIdx, row, column });
    } else {
      onSelect(null);
    }
  };

  useMount(() => {
    setIsLoading(true);
    loadTableData(dispatch).then(() => setIsLoading(false));

    return () => {
      dispatch(tableDuck.actions.resetState());
    };
  });

  return isLoading ? (
    <Loader />
  ) : (
    <TableResultRb
      data={reduxTableData}
      filteredDataKeys={filteredDataKeys}
      errors={errors}
      setColumns={handleSetColumns}
      setRows={handleSetRows}
      onRowClick={handleRowClick}
    />
  );
};
