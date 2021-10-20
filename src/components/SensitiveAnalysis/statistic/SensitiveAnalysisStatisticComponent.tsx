import React from 'react';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import { Loader } from '@consta/uikit/Loader';
import { Table } from '@consta/uikit/Table';

import './SensitiveAnalysisStatisticComponent.scss';

interface Props {
  statistic: SensitiveAnalysis;
  isLoading: boolean;
}

export const SensitiveAnalysisStatisticComponent: React.FC<Props> = ({
  statistic,
  isLoading,
}) => {
  const columns: any = [
    {
      title: 'входная переменная',
      accessor: 'inner',
      align: 'left',
    },
    {
      title: 'результат',
      columns: [
        {
          title: 'min',
          accessor: 'resultMin',
          align: 'right',
        },
        {
          title: 'max',
          accessor: 'resultMax',
          align: 'right',
        },
        {
          title: 'Диапазон',
          accessor: 'resultRange',
          align: 'right',
        },
      ],
    },
    {
      title: 'ввод',
      columns: [
        {
          title: 'min',
          accessor: 'enterMin',
          align: 'right',
        },
        {
          title: 'max',
          accessor: 'enterMax',
          align: 'right',
        },
      ],
    },
  ];

  const rows: any = [
    {
      inner: 'F',
      resultMin: '19 737,31',
      resultMax: '19 737,31',
      resultRange: '17 923,02',
      enterMin: '19 958,90',
      enterMax: '148 231,02',
    },
    {
      inner: 'Нефф',
      resultMin: '19 737,31',
      resultMax: '19 737,31',
      resultRange: '17 923,02',
      enterMin: '19 958,90',
      enterMax: '148 231,02',
    },
    {
      inner: 'Кп',
      resultMin: '19 737,31',
      resultMax: '19 737,31',
      resultRange: '17 923,02',
      enterMin: '19 958,90',
      enterMax: '148 231,02',
    },
    {
      inner: 'Плотность',
      resultMin: '19 737,31',
      resultMax: '19 737,31',
      resultRange: '17 923,02',
      enterMin: '19 958,90',
      enterMax: '148 231,02',
    },
    {
      inner: 'Пересеч. коэф',
      resultMin: '19 737,31',
      resultMax: '19 737,31',
      resultRange: '17 923,02',
      enterMin: '19 958,90',
      enterMax: '148 231,02',
    },
  ];

  return (
    <div className="sensitive-analysis">
      {isLoading ? (
        <Loader className="sensitive-analysis__loader" />
      ) : (
        <div>
          <div className="sensitive-analysis__title">Статистика</div>

          <Table columns={columns} rows={rows} zebraStriped="odd" />
        </div>
      )}
    </div>
  );
};
