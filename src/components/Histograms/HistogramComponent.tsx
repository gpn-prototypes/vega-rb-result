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
import { HistogramStatisticComponent } from './statistic/HistogramStatisticComponent';

import './HistogramComponent.scss';

interface Props {
  grid: GridCollection;
}

const DEFAULT_NUMBER_OF_ROWS = 50;

const payloadMenuItems: MenuContextItem[] = [
  {
    name: 'Кол-во столбцов в гистограмме',
    code: 'numberOfRows',
    choice: {
      value: DEFAULT_NUMBER_OF_ROWS,
      values: [25, DEFAULT_NUMBER_OF_ROWS, 100],
    },
  },
  {
    name: 'Показывать статистику',
    code: 'stat',
    switch: false,
    border: true,
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
  const [isShowStatistic, setIsShowStatistic] = useState<boolean>(false);
  const [numberOfRows, setNumberOfRows] = useState<number>(
    DEFAULT_NUMBER_OF_ROWS,
  );
  const [previousActiveRow, setPreviousActiveRow] = useState<
    GridActiveRow | undefined
  >(undefined);
  const [menuItems, setMenuItems] =
    useState<MenuContextItem[]>(payloadMenuItems);

  /** Запрашиваем данные в самом начале, берем самый первый элемент */
  useMount(() => {
    loadHistogramData(dispatch, [
      String(grid.rows[0][grid.columns[0].accessor]),
    ]).then(() => setIsLoading(false));

    return () => {
      dispatch(histogramDuck.actions.resetState());
    };
  });

  /** Отлавливаем выбор ячейки, выбор ячейки происходит по клику на таблице и по клику по ноде в дереве */
  useEffect(() => {
    if (activeRow?.title && previousActiveRow?.title !== activeRow.title) {
      setIsLoading(true);

      loadHistogramData(dispatch, activeRow.title.split(',')).then(() => {
        setIsLoading(false);

        setPreviousActiveRow(activeRow);
      });
    }
  }, [activeRow, previousActiveRow, dispatch, setPreviousActiveRow]);

  const handleChange = (item: MenuContextItem) => {
    if (item.code === 'stat') {
      const updatedMenuItems = menuItems.map((menuItem: MenuContextItem) => {
        const newItem = { ...menuItem };

        if (menuItem.code === 'stat') {
          newItem.switch = !item.switch;

          setIsShowStatistic(newItem.switch);
        }

        return newItem;
      });

      setMenuItems(updatedMenuItems);
    }

    if (item.code === 'numberOfRows') {
      setNumberOfRows(item.choice?.value || DEFAULT_NUMBER_OF_ROWS);
    }
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
            numberOfRows={numberOfRows}
          />
        );
      })}
    </div>
  );

  return (
    <div className="histogram">
      <div>
        <VerticalMoreContextMenu
          menuItems={() => (() => menuItems)()}
          title="Гистограмма запасов"
          onChange={handleChange}
          onClick={handleClick}
        />
      </div>
      {isLoading ? <Loader className="histogram__loader" /> : histograms}

      {isShowStatistic && (
        <div className="histogram__statistic-wrapper">
          <div className="histogram__statistic">
            <HistogramStatisticComponent />
          </div>

          <div className="histogram__statistic">
            <HistogramStatisticComponent />
          </div>
        </div>
      )}
    </div>
  );
};
