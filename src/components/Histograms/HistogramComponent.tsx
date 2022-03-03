import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VerticalMoreContextMenu } from '@app/components/Helpers/VerticalMoreContextMenu/VerticalMoreContextMenu';
import { Histogram } from '@app/generated/graphql';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { HistogramActions } from '@app/store/histogram/HistogramActions';
import { getDomainEntityNames } from '@app/store/histogram/HistogramEpics';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { Loader } from '@consta/uikit/Loader';
import { Text } from '@consta/uikit/Text';
import { useMount } from '@gpn-prototypes/vega-ui';
import { block } from 'bem-cn';

import ChartComponent from './chart/Chart';
import { HistogramStatisticsComponent } from './statistic/HistogramStatisticsComponent';

import './HistogramComponent.css';

const cn = block('Histogram');

interface Props {
  grid: GridCollection;
}

export const HistogramComponent: React.FC<Props> = ({ grid }) => {
  /** State */
  const dispatch = useDispatch();
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

  /** Callback */
  const resetHistogramState = useCallback(
    () => dispatch(HistogramActions.resetState()),
    [dispatch],
  );

  useMount(() => {
    return resetHistogramState;
  });

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
    return (
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
  }, [histograms, numberOfRows]);

  const histogramsWrapper = useMemo(() => {
    return histograms?.length ? (
      <div>
        <div className={cn('Header')}>
          <VerticalMoreContextMenu
            menuItems={menuItems}
            title="Гистограмма запасов"
            onChange={handleChange}
            onClick={() => {}}
          />

          <div className={cn('ActiveRow')}>
            <Text view="ghost" size="s">
              Выбранный элемент:
            </Text>

            <Text size="s"> {activeRow?.title.split(',').join(', ')}</Text>
          </div>
        </div>

        {histogramsBlock}
      </div>
    ) : (
      <Text>Данные не найдены</Text>
    );
  }, [histograms, histogramsBlock, menuItems, activeRow, handleChange]);

  const statistic = isShowStatistic && (
    <HistogramStatisticsComponent
      domainEntityNames={getDomainEntityNames(activeRow, grid)}
      bins={numberOfRows}
    />
  );

  return (
    <div className={cn()}>
      {isLoading ? (
        <Loader className={cn('Loader')} />
      ) : (
        <div data-testid="histogram-wrapper">
          {histogramsWrapper}
          {statistic}
        </div>
      )}
    </div>
  );
};
