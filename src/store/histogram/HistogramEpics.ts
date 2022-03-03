import { Histogram, HistogramStatistic } from '@app/generated/graphql';
import { ofAction } from '@app/operators/ofAction';
import {
  loadHistogramData,
  loadHistogramStatisticData,
} from '@app/services/histogramService';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import {
  distinctUntilChanged,
  ignoreElements,
  switchMap,
  tap,
} from 'rxjs/operators';

import { LoaderAction } from '../loader/loaderActions';
import { TableActions } from '../table/tableActions';
import { EpicDependencies, RootState } from '../types';

import { HistogramActions } from './HistogramActions';

export const getDomainEntityNames = (
  row: GridActiveRow | undefined,
  grid: GridCollection,
): string[] => {
  return row !== undefined
    ? row.title.split(',')
    : [String((grid.rows[0][grid.columns[0].accessor] as any)?.value)];
};

const loadHistogramEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  EpicDependencies
> = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofAction(TableActions.setActiveRow, HistogramActions.setNumberOfRows),
    tap(() => dispatch(LoaderAction.setLoading('histogram'))),
    distinctUntilChanged(),
    switchMap(({ payload }) => {
      if (payload === undefined || typeof payload === 'object') {
        return from(
          loadHistogramData(
            getDomainEntityNames(payload, state$.value.table),
            state$.value.histogram.numberOfRows,
          ),
        );
      }

      return from(
        loadHistogramData(
          getDomainEntityNames(
            state$.value.table.activeRow,
            state$.value.table,
          ),
          payload,
        ),
      );
    }),
    tap((histograms: Histogram[]) =>
      dispatch(HistogramActions.setHistograms(histograms)),
    ),
    tap(() => dispatch(LoaderAction.setLoaded('histogram'))),
    ignoreElements(),
  );

const loadHistogramStatisticEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  EpicDependencies
> = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofAction(HistogramActions.loadStatistic, TableActions.setActiveRow),
    tap(() => dispatch(LoaderAction.setLoading('histogram-statistic'))),
    switchMap(() => {
      if (!state$.value.histogram.isShowStatistic) {
        return of([]);
      }

      return from(
        loadHistogramStatisticData(
          getDomainEntityNames(
            state$.value.table.activeRow,
            state$.value.table,
          ),
          state$.value.histogram.numberOfRows,
        ),
      );
    }),
    tap((statistics: HistogramStatistic[]) =>
      dispatch(HistogramActions.setStatistics(statistics)),
    ),
    tap(() => dispatch(LoaderAction.setLoaded('histogram-statistic'))),
    ignoreElements(),
  );

export const HistogramEpics = [loadHistogramEpic, loadHistogramStatisticEpic];
