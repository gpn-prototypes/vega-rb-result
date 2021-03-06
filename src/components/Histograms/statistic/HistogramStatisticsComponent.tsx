import React, { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HistogramStatistic,
  HistogramStatisticValues,
} from '@app/generated/graphql';
import { HistogramActions } from '@app/store/histogram/HistogramActions';
import { RootState } from '@app/store/types';
import { MathHelper } from '@app/utils/MathHelper';
import { Loader } from '@consta/uikit/Loader';
import { block } from 'bem-cn';

import './HistogramStatisticsComponent.css';

const cn = block('HistogramStatistics');

interface Props {
  domainEntityNames: string[];
  bins: number;
}

export const HistogramStatisticsComponent: FC<Props> = () => {
  /** Store */
  const dispatch = useDispatch();
  const statistics: HistogramStatistic[] = useSelector(
    ({ histogram }: RootState) => histogram.statistics,
  );
  const isLoading: boolean = useSelector(
    ({ loader }: RootState) => loader.loading['histogram-statistic'],
  );

  const loadStatistics = useCallback(() => {
    dispatch(HistogramActions.loadStatistic());
  }, [dispatch]);

  /** Обновляем данные при первой загрузке */
  useEffect(() => loadStatistics(), [loadStatistics]);

  const getRows = (
    innerStatistic: HistogramStatistic,
    isPercentile = false,
  ) => {
    return (
      isPercentile ? innerStatistic.percentiles : innerStatistic.mathStats
    ).map((stat: HistogramStatisticValues) => (
      <div className={cn('Rows', { same: isPercentile })}>
        <div className={cn('Row')}>{stat.name}</div>
        <div className={cn('Row', { last: true })}>
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
    <Loader className={cn('Loader')} />
  ) : (
    <div className={cn('Wrapper')}>
      {statistics.map((innerStatistic: HistogramStatistic) => {
        return (
          <div>
            <div className={cn('Statistics')}>
              <div>{getRows(innerStatistic)}</div>
              <div>{getRows(innerStatistic, true)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
