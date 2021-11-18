import React from 'react';
import {
  Column,
  Row,
} from '@app/components/TableResultRbController/TableResultRb/types';
import {
  SensitiveAnalysisStatistic,
  SensitiveAnalysisStatisticCell,
  SensitiveAnalysisStatisticHeaders,
  SensitiveAnalysisStatisticRows,
} from '@app/interfaces/SensitiveAnalysisInterface';
import { Table } from '@consta/uikit/Table';

interface Props {
  statistic: SensitiveAnalysisStatistic;
}

const getMappedColumn = (
  header: SensitiveAnalysisStatisticHeaders,
  isLeft = true,
): Column<any, string> => {
  return {
    title: header.name,
    accessor: header.code,
    align: isLeft ? 'left' : 'right',
    renderCell: (row: Row) => {
      if (header.decimal !== 0) {
        return Number(row[header.code])
          .toFixed(header.decimal || 3)
          .toString();
      }

      return row[header.code];
    },
  };
};

const getMappedRow = (cells: SensitiveAnalysisStatisticCell[]): Row => {
  const row: Row = {};

  cells.forEach((cell: SensitiveAnalysisStatisticCell) => {
    row[cell.code] = cell.value;
  });

  return row;
};

export const SensitiveAnalysisStatisticComponent: React.FC<Props> = ({
  statistic,
}) => {
  const columns: any[] = statistic.headers.map(
    (header: SensitiveAnalysisStatisticHeaders) => {
      if (header?.children && header?.children?.length > 0) {
        return {
          title: header.name,
          columns: header.children.map(
            (childrenHeader: SensitiveAnalysisStatisticHeaders) =>
              getMappedColumn(childrenHeader, false),
          ),
        };
      }

      return getMappedColumn(header);
    },
  );

  const rows: Row[] = statistic.rows.map(
    (row: SensitiveAnalysisStatisticRows) => getMappedRow(row.cells),
  );

  return <Table columns={columns} rows={rows} zebraStriped="odd" />;
};
