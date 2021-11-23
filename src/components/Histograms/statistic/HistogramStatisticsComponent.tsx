import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HistogramStatistic,
  HistogramStatisticValues,
} from '@app/generated/graphql';
import { loadHistogramStatisticData } from '@app/services/histogramService';
import { RootState } from '@app/store/types';
import { GridActiveRow } from '@app/types/typesTable';
import { Loader } from '@consta/uikit/Loader';
import { useMount } from '@gpn-prototypes/vega-ui';

import './HistogramStatisticsComponent.scss';

interface Props {
  domainEntityNames: string[];
  bins: number;
}

export const HistogramStatisticsComponent: React.FC<Props> = ({
  domainEntityNames,
  bins,
}) => {
  const dispatch = useDispatch();
  const statistics: HistogramStatistic[] = useSelector(
    ({ histograms }: RootState) => histograms.statistics,
  );
  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(() => {
    setIsLoading(true);

    loadHistogramStatisticData(dispatch, domainEntityNames, bins).then(() =>
      setIsLoading(false),
    );
  }, [domainEntityNames, bins, dispatch, setIsLoading]);

  /** Обновляем данные при первой загрузке */
  useMount(() => loadData());

  /** При каждом обновлении выбранной ячейки - обновляем данные */
  useEffect(() => {
    loadData();
  }, [activeRow, loadData]);

  const getRows = (
    innerStatistic: HistogramStatistic,
    isPercentile = false,
  ) => {
    return (
      isPercentile ? innerStatistic.percentiles : innerStatistic.mathStats
    ).map((stat: HistogramStatisticValues) => (
      <div
        className={
          isPercentile
            ? 'histogram-statistics__rows histogram-statistics__rows_same'
            : 'histogram-statistics__rows'
        }
      >
        <div className="histogram-statistics__row">{stat.name}</div>
        <div className="histogram-statistics__row histogram-statistics__row_last">
          {innerStatistic.decimal
            ? Number(stat.value).toFixed(innerStatistic.decimal).toString()
            : stat.value}
        </div>
      </div>
    ));
  };

  return isLoading || !statistics?.length ? (
    <Loader className="histogram-statistics__loader" />
  ) : (
    <div className="histogram-statistics__wrapper">
      {statistics.map((innerStatistic: HistogramStatistic) => {
        return (
          <div className="histogram-statistics__statistic">
            <div>{getRows(innerStatistic)}</div>
            <div>{getRows(innerStatistic, true)}</div>
          </div>
        );
      })}
    </div>
  );
};