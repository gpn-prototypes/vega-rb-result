import React, { FC } from 'react';
import {
  Column,
  RowEntity,
} from '@app/components/TableResultRbController/TableResultRb/types';
import {
  SensitiveAnalysisStatistic,
  SensitiveAnalysisStatisticCell,
  SensitiveAnalysisStatisticHeaders,
  SensitiveAnalysisStatisticRows,
} from '@app/interfaces/SensitiveAnalysisInterface';
import { MathHelper } from '@app/utils/MathHelper';
import { Table } from '@consta/uikit/Table';

interface Props {
  statistic: SensitiveAnalysisStatistic;
}

const getMappedColumn = (
  header: SensitiveAnalysisStatisticHeaders,
  isLeft = true,
): Column<any> => {
  return {
    title: header.name,
    accessor: header.code,
    align: isLeft ? 'left' : 'right',
    renderCell: (row: RowEntity) => {
      if (Number(row[header.code]) === 0) {
        return '—';
      }

      if (header.decimal !== 0) {
        return MathHelper.getNormalizerFixed(
          header.decimal || 3,
          Number(row[header.code]),
        );
      }

      return row[header.code];
    },
  };
};

const getMappedRow = (
  cells: SensitiveAnalysisStatisticCell[],
): Record<string, string> => {
  const row: Record<string, string> = {};

  cells.forEach((cell: SensitiveAnalysisStatisticCell) => {
    row[cell.code] = cell.value;
  });

  return row;
};

export const SensitiveAnalysisStatisticComponent: FC<Props> = ({
  statistic,
}) => {
  const columns: any[] = statistic?.headers.map(
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

  const rows: Record<string, string>[] = statistic?.rows.map(
    (row: SensitiveAnalysisStatisticRows) => getMappedRow(row.cells),
  );

  return <Table columns={columns} rows={rows as any} zebraStriped="odd" />;
};
