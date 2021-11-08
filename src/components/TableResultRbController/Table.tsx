import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { TableResultRb } from '@app/components/TableResultRbController/TableResultRb/TableResultRb';
import { loadTableData } from '@app/services/loadTableData';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { Loader, useMount } from '@gpn-prototypes/vega-ui';

export const Table: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const reduxTableData = useSelector(({ table }: RootState) => table);
  const filterData = useSelector(({ tree }: RootState) => tree.filter);

  const [isLoading, setIsLoading] = useState(true);

  useMount(() => {
    setIsLoading(true);

    loadTableData(dispatch)
      .catch(() => {
        /** Придумать механизм редиректа между проектами */
        history.push(window.location.pathname.replace('/rb-result', '/rb'));
      })
      .then(() => setIsLoading(false));

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
