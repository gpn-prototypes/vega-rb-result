import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EFluidType } from '@app/constants/Enums';
import {
  HistogramStatistic,
  HistogramStatisticValues,
} from '@app/generated/graphql';
import { loadHistogramStatisticData } from '@app/services/histogramService';
import histogramDuck from '@app/store/histogramDuck';
import { RootState } from '@app/store/types';
import { MathHelper } from '@app/utils/MathHelper';
import { Loader } from '@consta/uikit/Loader';
import { Text } from '@consta/uikit/Text';
import { useMount } from '@gpn-prototypes/vega-ui';

import './HistogramStatisticsComponent.css';

interface Props {
  domainEntityNames: string[];
  bins: number;
}

export const HistogramStatisticsComponent: React.FC<Props> = ({
  domainEntityNames,
  bins,
}) => {
  const dispatch = useDispatch();
  const setStatistics = useCallback(
    (statistics: HistogramStatistic[]) =>
      dispatch(histogramDuck.actions.setStatistics(statistics)),
    [dispatch],
  );
  const statistics: HistogramStatistic[] = useSelector(
    ({ histograms }: RootState) => histograms.statistics,
  );
  const fluidType: string = useSelector(
    ({ table }: RootState) => table.fluidType || EFluidType.ALL,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(() => {
    setIsLoading(true);

    loadHistogramStatisticData(
      setStatistics,
      domainEntityNames,
      bins,
      fluidType,
    ).then(() => setIsLoading(false));
  }, [domainEntityNames, bins, fluidType, setStatistics, setIsLoading]);

  /** Обновляем данные при первой загрузке */
  useMount(() => loadData());

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
          {innerStatistic.decimal !== undefined
            ? MathHelper.getNormalizerFixed(
                innerStatistic.decimal,
                Number(stat.value),
              )
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
          <div>
            <Text>{innerStatistic.title}</Text>
            <div className="histogram-statistics__statistic">
              <div>{getRows(innerStatistic)}</div>
              <div>{getRows(innerStatistic, true)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
