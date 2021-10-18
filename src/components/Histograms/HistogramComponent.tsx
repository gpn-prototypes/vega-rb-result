import React , { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { Loader, useMount } from '@gpn-prototypes/vega-ui';
import { Histogram } from '@app/generated/graphql';
import { loadHistogramData } from '@app/services/histogramService';
import histogramDuck from '@app/store/histogramDuck';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { VerticalMoreContextMenu } from '@app/components/Helpers/ContextMenuHelper';

import './HistogramComponent.css';
import ChartComponent from './chart/Chart';

interface Props {
  table: GridCollection;
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

export const HistogramComponent: React.FC<Props> = ({ table }) => {
  const dispatch = useDispatch();

  const histogramsPayload: Histogram[] = useSelector(({ histograms }: RootState) => histograms.payload);
  const activeRow: GridActiveRow | undefined = useSelector(({ table }: RootState) => table.activeRow);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [menuItems, setMenuItems] = useState<MenuContextItem[]>(payloadMenuItems);

  /** Запрашиваем данные в самом начале, берем самый первый элемент */
  useMount(() => {
    loadHistogramData(
      dispatch,
      [table.columns[0].accessor],
      [String(table.rows[0][table.columns[0].accessor])],
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
  }, [activeRow]);

  const handleChange = (item: MenuContextItem) => {
    const updatedMenuItems = menuItems.map((menuItem: MenuContextItem) => {
      if (menuItem.code === item.code) {
        menuItem.switch = !menuItem.switch;
      }

      return menuItem;
    });

    setMenuItems(updatedMenuItems);
  }

  const handleClick = (item: MenuContextItem) => {
    console.log('handle click', item);
  }

  return <div className="histogram">
    <div>
      <VerticalMoreContextMenu
        menuItems={menuItems}
        title="Гистограмма запасов"
        onChange={handleChange}
        onClick={handleClick}
      />
    </div>
    {isLoading
      ? <Loader className="histogram__loader" />
      : (
      <div className="histogram__content">
        {histogramsPayload?.map((histogram: Histogram) => {
          return <ChartComponent
            title={histogram.title}
            subtitle={histogram.subtitle}
            percentiles={histogram.percentiles}
            sample={histogram.sample}
            numberOfIterationBin={histogram.numberOfIterationBin}
          />;
        })}
      </div>
    )}
  </div>
};
