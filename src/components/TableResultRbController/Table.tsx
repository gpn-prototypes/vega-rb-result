import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableResultRb } from '@app/components/TableResultRbController/TableResultRb/TableResultRb';
import { loadTableData } from '@app/services/loadTableData';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { Loader, useMount } from '@gpn-prototypes/vega-ui';

export const Table: React.FC = () => {
  const dispatch = useDispatch();
  const reduxTableData = useSelector(({ table }: RootState) => table);
  const filterData = useSelector(({ tree }: RootState) => tree.filter);

  const [isLoading, setIsLoading] = useState(true);

  useMount(() => {
    setIsLoading(true);

    loadTableData(dispatch).then(() => setIsLoading(false));

    return () => {
      dispatch(TableActions.resetState());
    };
  });

  return isLoading ? (
    <Loader />
  ) : (
    <TableResultRb
      columns={reduxTableData.columns}
      rows={reduxTableData.rows}
      filter={filterData}
    />
  );
};
