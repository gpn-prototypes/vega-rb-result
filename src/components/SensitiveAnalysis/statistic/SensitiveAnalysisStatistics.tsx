import React, { FC } from 'react';
import {
  SensitiveAnalysisStatistic,
  SensitiveAnalysisStatisticCell,
  SensitiveAnalysisStatisticHeaders,
  SensitiveAnalysisStatisticRows,
} from '@app/interfaces/SensitiveAnalysisInterface';
import { MathHelper } from '@app/utils/MathHelper';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Table, TableColumn, TableRow } from '@consta/uikit/Table';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import './SensitiveAnalysisStatistics.css';

const cn = block('SensitiveAnalysisStatistics');

interface Props {
  statistic: SensitiveAnalysisStatistic;
}

const getMappedColumn = (
  header: SensitiveAnalysisStatisticHeaders,
  isLeft = true,
): TableColumn<TableRow> => {
  const title = header.name;

  const column: TableColumn<TableRow> = {
    title,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accessor: header.code as any,
    align: isLeft ? 'left' : 'center',
    renderCell: (row: TableRow) => {
      if (Number(row[header.code]) === 0) {
        return '—';
      }

      if (header.decimal !== 0) {
        return MathHelper.getNormalizerFixed(
          header.decimal || 3,
          Number(row[header.code]),
        );
      }

      return (
        <Text as="div" size="s" className={cnMixSpace({ pH: 'xs', pV: '2xs' })}>
          {row[header.code]}
        </Text>
      );
    },
  };

  return column;
};

const getMappedRow = (cells: SensitiveAnalysisStatisticCell[]): TableRow => {
  const row: TableRow = {} as TableRow;

  cells.forEach((cell: SensitiveAnalysisStatisticCell) => {
    row[cell.code] = cell.value;
  });

  return row;
};

export const SensitiveAnalysisStatistics: FC<Props> = ({ statistic }) => {
  const columns: TableColumn<TableRow>[] = statistic?.headers.map(
    (header: SensitiveAnalysisStatisticHeaders) => {
      if (header?.children && header?.children?.length > 0) {
        return {
          title: header.name === 'НГЗ/НГР' ? 'НГЗ/НГР, млн.м³' : header.name,
          columns: header.children.map(
            (childrenHeader: SensitiveAnalysisStatisticHeaders) =>
              getMappedColumn(childrenHeader, false),
          ),
        };
      }

      return getMappedColumn(header);
    },
  );

  const rows: TableRow[] = statistic?.rows.map(
    (row: SensitiveAnalysisStatisticRows) => getMappedRow(row.cells),
  );

  return (
    <Table columns={columns} className={cn()} rows={rows} zebraStriped="odd" />
  );
};
