import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableResultRb } from '@app/components/TableResultRbController/TableResultRb/TableResultRb';
import { loadTableData } from '@app/services/loadTableData';
import { GeneralActions } from '@app/store/general/generalActions';
import { LoaderAction } from '@app/store/loader/loaderActions';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { GridCollection } from '@app/types/typesTable';
import { Loader } from '@consta/uikit/Loader';
import { useMount } from '@gpn-prototypes/vega-ui';

export const Table: React.FC = () => {
  const dispatch = useDispatch();
  const setNotFound = useCallback(
    (isNotFound: boolean) => dispatch(GeneralActions.setNotFound(isNotFound)),
    [dispatch],
  );
  const resetState = useCallback(
    () => dispatch(TableActions.resetState()),
    [dispatch],
  );

  const setEntitiesCount = useCallback(
    (count: number) => dispatch(TableActions.setEntitiesCount(count)),
    [dispatch],
  );

  const setTable = useCallback(
    (table: GridCollection) => dispatch(TableActions.initState(table)),
    [dispatch],
  );

  const reduxTableData = useSelector(({ table }: RootState) => table);
  const filterData = useSelector(({ tree }: RootState) => tree.filter);

  const isLoading = useSelector(
    ({ loader }: RootState) => loader.loading.table,
  );

  // TODO: Вынести загрузку таблицы в эпик
  useMount(() => {
    dispatch(LoaderAction.setLoading('table'));

    const load = async () => {
      try {
        await loadTableData(setTable, setEntitiesCount);
        dispatch(LoaderAction.setLoaded('table'));
      } catch (e) {
        setNotFound(true);
      }
    };

    load();

    return resetState;
  });

  return isLoading || !reduxTableData || !reduxTableData.actualColumns ? (
    <Loader />
  ) : (
    <TableResultRb
      columns={reduxTableData.columns}
      actualColumns={reduxTableData.actualColumns}
      rows={reduxTableData.rows}
      filter={filterData}
    />
  );
};
