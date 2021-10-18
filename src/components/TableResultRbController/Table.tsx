import React, { useState } from 'react';
import { Loader, useMount } from '@gpn-prototypes/vega-ui';
import { TableResultRb } from '@app/components/TableResultRbController/TableResultRb/TableResultRb';
import { loadTableData } from '@app/services/loadTableData';
import { useDispatch, useSelector } from 'react-redux';
import tableDuck from '@app/store/tableDuck';
import { RootState } from '@app/store/types';
import { EFluidType } from '@app/common/enums';

interface IProps {}

export const Table: React.FC<IProps> = () => {
  const dispatch = useDispatch();
  const reduxTableData = useSelector(({ table }: RootState) => table);
  const filterData = useSelector(({ tree }: RootState) => tree.filter);
  const fluidType = useSelector(({ table }: RootState) => table.fluidType);

  const [isLoading, setIsLoading] = useState(true);

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
      columns={reduxTableData.columns}
      rows={reduxTableData.rows}
      filter={filterData}
      fluidType={fluidType || EFluidType.ALL}
    />
  );
};
