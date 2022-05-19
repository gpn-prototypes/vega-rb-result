import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { HiddenColumns } from '@app/types/typesTable';
import { Button } from '@consta/uikit/Button';
import { IconAdd } from '@consta/uikit/IconAdd';
import { IconRemove } from '@consta/uikit/IconRemove';

import { Column } from '../TableResultRbController/TableResultRb/types';

interface Props {
  column: Column;
}

export const ColumnExpanderComponent: FC<Props> = ({ column }) => {
  const dispatch = useDispatch();
  const setHiddenColumns = useCallback(
    (hidden: HiddenColumns) => dispatch(TableActions.setHiddenColumns(hidden)),
    [dispatch],
  );

  const hiddenColumns: HiddenColumns | undefined = useSelector(
    ({ table }: RootState) => table.hiddenColumns,
  );

  const getIcon = () => {
    if (hiddenColumns && hiddenColumns[column.accessor]) {
      return IconAdd;
    }

    return IconRemove;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hidden = { ...hiddenColumns };

    hidden[column.accessor] = !hidden[column.accessor];

    setHiddenColumns(hidden);
  };

  // console.log(hiddenColumns, column);

  return (
    <Button
      size="xs"
      iconSize="s"
      view="clear"
      onClick={handleClick}
      onlyIcon
      iconLeft={getIcon()}
    />
  );
};
