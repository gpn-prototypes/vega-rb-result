import React from 'react';

import './HistogramStatisticComponent.scss';

interface Payload {
  left: string;
  right: string;
}

export const HistogramStatisticComponent: React.FC = () => {
  const rows1: any = [
    {
      left: 'Среднее',
      right: '1 322',
    },
    {
      left: 'Медиана',
      right: '1 120',
    },
    {
      left: 'Стандартное отклонение',
      right: '430',
    },
    {
      left: 'Коэффициент ассиметрии',
      right: '1 153',
    },
    {
      left: 'Минимум',
      right: '482',
    },
  ];

  const rows2: any = [
    {
      left: 'P100',
      right: '1 322',
    },
    {
      left: 'P90',
      right: '1 120',
    },
    {
      left: 'P80',
      right: '430',
    },
    {
      left: 'P70',
      right: '1 153',
    },
    {
      left: 'P60',
      right: '482',
    },
    {
      left: 'P50',
      right: '1 322',
    },
    {
      left: 'P40',
      right: '1 120',
    },
    {
      left: 'P30',
      right: '482',
    },
    {
      left: 'P20',
      right: '1 322',
    },
    {
      left: 'P10',
      right: '482',
    },
  ];

  const getRows = (elements: Payload[], isSame = false) => {
    return elements.map((element: Payload) => (
      <div
        className={
          isSame
            ? 'histogram-statistic__rows histogram-statistic__rows_same'
            : 'histogram-statistic__rows'
        }
      >
        <div className="histogram-statistic__row">{element.left}</div>
        <div className="histogram-statistic__row histogram-statistic__row_last">
          {element.right}
        </div>
      </div>
    ));
  };

  return (
    <div className="histogram-statistic">
      <div>{getRows(rows1)}</div>
      <div>{getRows(rows2, true)}</div>
    </div>
  );
};
