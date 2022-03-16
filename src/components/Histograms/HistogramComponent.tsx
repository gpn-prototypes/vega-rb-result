import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VerticalMoreContextMenu } from '@app/components/Helpers/VerticalMoreContextMenu/VerticalMoreContextMenu';
import { Histogram } from '@app/generated/graphql';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { HistogramActions } from '@app/store/histogram/HistogramActions';
import { getDomainEntityNames } from '@app/store/histogram/HistogramEpics';
import { RootState } from '@app/store/types';
import { GridActiveRow } from '@app/types/typesTable';
import { Loader } from '@consta/uikit/Loader';
import { Text } from '@consta/uikit/Text';
import { block } from 'bem-cn';

import ChartComponent from './chart/Chart';
import { HistogramStatisticsComponent } from './statistic/HistogramStatisticsComponent';

import './HistogramComponent.css';

const cn = block('Histogram');

export const HistogramComponent: React.FC = () => {
  /** Store */
  const dispatch = useDispatch();

  const grid = useSelector(({ table }: RootState) => table);
  const numberOfRows = useSelector(
    ({ histogram }: RootState) => histogram.numberOfRows,
  );
  const isShowStatistic = useSelector(
    ({ histogram }: RootState) => histogram.isShowStatistic,
  );
  const menuItems = useSelector(
    ({ histogram }: RootState) => histogram.menuItems,
  );
  const histograms = useSelector(
    ({ histogram }: RootState) => histogram.histograms,
  );
  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );
  const isLoading: boolean = useSelector(
    ({ loader }: RootState) => loader.loading.histogram,
  );

  const handleChange = useCallback(
    (item: MenuContextItem) => {
      dispatch(HistogramActions.updateMenuItem(item));

      if (item.code === 'numberOfRows') {
        dispatch(HistogramActions.setNumberOfRows(item.choice?.value));
      }
    },
    [dispatch],
  );

  const histogramsBlock = useMemo(() => {
    return isLoading ? (
      <div className={cn('Loader')}>
        <Loader />
      </div>
    ) : (
      <div className={cn('Content')}>
        {histograms?.map((histogram: Histogram, index: number) => {
          return (
            <ChartComponent
              title={histogram.title}
              subtitle={histogram.subtitle}
              percentiles={histogram.percentiles}
              sample={histogram.sample}
              numberOfIterationBin={histogram.numberOfIterationBin}
              cdf={histogram.cdf}
              numberOfRows={numberOfRows}
              id={index.toString()}
            />
          );
        })}
      </div>
    );
  }, [histograms, numberOfRows, isLoading]);

  const histogramsWrapper = useMemo(() => {
    return !histograms?.length && isLoading === false ? (
      <Text>Данные не найдены</Text>
    ) : (
      <div>
        <div className={cn('Header')}>
          <VerticalMoreContextMenu
            menuItems={menuItems}
            title="Гистограмма"
            onChange={handleChange}
            onClick={() => {}}
          />

          <div className={cn('ActiveRow')}>
            <Text view="ghost" size="s">
              Выбранный объект:
            </Text>

            <Text size="s">&nbsp;{activeRow?.title.split(',').join(', ')}</Text>
          </div>
        </div>

        {histogramsBlock}
      </div>
    );
  }, [
    histograms,
    histogramsBlock,
    menuItems,
    activeRow,
    isLoading,
    handleChange,
  ]);

  const statistic = isShowStatistic && (
    <HistogramStatisticsComponent
      domainEntityNames={getDomainEntityNames(activeRow, grid)}
      bins={numberOfRows}
    />
  );

  return (
    <div className={cn()}>
      <div data-testid="histogram-wrapper">
        {histogramsWrapper}
        {statistic}
      </div>
    </div>
  );
};
