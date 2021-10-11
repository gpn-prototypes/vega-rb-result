import React, { useMemo } from 'react';
import { Table } from '@consta/uikit/Table';
import { Column, Row } from './types';
import { RbDomainEntityInput } from '@app/generated/graphql';

import './TableResultRb.css';

interface Props {
  rows: Row<RbDomainEntityInput>[];
  columns: Column<RbDomainEntityInput>[];
}

export const TableResultRb: React.FC<Props> = ({ rows, columns }) => {
  console.log(123, rows, columns);
  // const [sortSetting, setSortSetting] = useState<SortByProps<any> | null>(null);

  // const sortedRows = rows
  //   .sort((a, b) => {
  //     if (sortSetting?.sortingBy === 'date') {
  //       const [firstDate, secondDate] =
  //         sortSetting.sortOrder === 'asc' ? [a.date, b.date] : [b.date, a.date];
  //       return firstDate.valueOf() - secondDate.valueOf();
  //     }
  //     return 0;
  //   });

  // return <Table rows={rows} columns={columns} onSortBy={setSortSetting} />;

  const preparedColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      mergeCells: true,
    }));
  }, [columns]);

  return (
    <Table
      rows={rows}
      columns={preparedColumns}
      verticalAlign="center"
      size="s"
      zebraStriped="odd"
      className="TableResultRb"
      borderBetweenColumns
      borderBetweenRows
      isResizable
    />
  );
};