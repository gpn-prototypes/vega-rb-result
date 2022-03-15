import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableResultRb } from '@app/components/TableResultRbController/TableResultRb/TableResultRb';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { Loader } from '@consta/uikit/Loader';
import { useMount } from '@gpn-prototypes/vega-ui';

export const Table: React.FC = () => {
  const dispatch = useDispatch();

  const reduxTableData = useSelector(({ table }: RootState) => table);
  const filterData = useSelector(({ tree }: RootState) => tree.filter);
  const isLoading = useSelector(
    ({ loader }: RootState) => loader.loading.table,
  );

  useMount(() => {
    dispatch(TableActions.initLoadTable());
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
