import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VerticalMoreContextMenu } from '@app/components/Helpers/ContextMenuHelper';
import { Histogram } from '@app/generated/graphql';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { loadHistogramData } from '@app/services/histogramService';
import histogramDuck from '@app/store/histogramDuck';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { Loader, useMount } from '@gpn-prototypes/vega-ui';

import ChartComponent from './chart/Chart';

import './HistogramComponent.scss';

interface Props {
  grid: GridCollection;
}

const payloadMenuItems: MenuContextItem[] = [
  {
    name: 'Кол-во столбцов в гистограмме',
  },
  {
    name: 'Показывать статистику',
    code: 'stat',
    switch: false,
  },
];

export const HistogramComponent: React.FC<Props> = ({ grid }) => {
  const dispatch = useDispatch();

  const histogramsPayload: Histogram[] = useSelector(
    ({ histograms }: RootState) => histograms.payload,
  );
  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [menuItems, setMenuItems] =
    useState<MenuContextItem[]>(payloadMenuItems);

  /** Запрашиваем данные в самом начале, берем самый первый элемент */
  useMount(() => {
    loadHistogramData(
      dispatch,
      [grid.columns[0].accessor],
      [String(grid.rows[0][grid.columns[0].accessor])],
    ).then(() => setIsLoading(false));

    return () => {
      dispatch(histogramDuck.actions.resetState());
    };
  });

  /** Отлавливаем выбор ячейки, выбор ячейки происходит по клику на таблице и по клику по ноде в дереве */
  useEffect(() => {
    setIsLoading(true);

    if (activeRow?.code) {
      loadHistogramData(
        dispatch,
        activeRow.code.split(','),
        activeRow.title.split(','),
      ).then(() => setIsLoading(false));
    }
  }, [activeRow, dispatch]);

  const handleChange = (item: MenuContextItem) => {
    const updatedMenuItems = menuItems.map((menuItem: MenuContextItem) => {
      const newItem = { ...menuItem };

      if (menuItem.code === item.code) {
        newItem.switch = !menuItem.switch;
      }

      return newItem;
    });

    setMenuItems(updatedMenuItems);
  };

  const handleClick = (item: MenuContextItem) => {
    console.log('handle click', item);
  };

  const histograms = (
    <div className="histogram__content">
      {histogramsPayload?.map((histogram: Histogram) => {
        return (
          <ChartComponent
            title={histogram.title}
            subtitle={histogram.subtitle}
            percentiles={histogram.percentiles}
            sample={histogram.sample}
            numberOfIterationBin={histogram.numberOfIterationBin}
          />
        );
      })}
    </div>
  );

  return (
    <div className="histogram">
      <div>
        <VerticalMoreContextMenu
          menuItems={menuItems}
          title="Гистограмма запасов"
          onChange={handleChange}
          onClick={handleClick}
        />
      </div>
      {isLoading ? <Loader className="histogram__loader" /> : histograms}
    </div>
  );
};
