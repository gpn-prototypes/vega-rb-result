import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableResultRb } from '@app/components/TableResultRbController/TableResultRb/TableResultRb';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { Loader } from '@consta/uikit/Loader';

export const Table: React.FC = () => {
  const dispatch = useDispatch();

  const reduxTableData = useSelector(({ table }: RootState) => table);
  const filterData = useSelector(({ tree }: RootState) => tree.filter);
  const isLoading = useSelector(
    ({ loader }: RootState) => loader.loading.table,
  );

  useEffect(() => {
    dispatch(TableActions.initLoadTable());
  }, [dispatch]);

  const isLoadingState = useMemo(() => {
    return isLoading || !reduxTableData || !reduxTableData.actualColumns;
  }, [isLoading, reduxTableData]);

  return isLoadingState ? (
    <Loader />
  ) : (
    <TableResultRb
      columns={reduxTableData.columns}
      actualColumns={reduxTableData.actualColumns || []}
      rows={reduxTableData.rows}
      filter={filterData}
    />
  );
};
