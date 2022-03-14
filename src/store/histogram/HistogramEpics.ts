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
  filter,
  ignoreElements,
  pairwise,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { LoaderAction } from '../loader/loaderActions';
import { TableActions } from '../table/tableActions';
import { tableActiveRowSelector } from '../table/TableSelectors';
import { RootState, StoreDependencies } from '../types';

import { HistogramActions } from './HistogramActions';

export const getDomainEntityNames = (
  row: GridActiveRow | undefined,
  grid: GridCollection,
): string[] => {
  return row !== undefined
    ? row.title.split(',')
    : [String((grid.rows[0][grid.columns[0].accessor] as any)?.value)];
};

/**
 * Делаем через DOM, ибо не хочется всю структуру таблицы обновлять, ради одного класса
 * Находим в DOM текущую ячейку и ячейку из пред. состояния
 * Убираем класс у пред. ячейки и добавляем новой
 *
 * Хотел вынести в отдельный epic. Но pairwise работает не корректно,
 * когда несколько action на разные эпики и выдает не корректные old/new state
 */
function toggleActiveTableCellClass(
  newState: RootState,
  oldState: RootState,
): void {
  /** TODO: Оптимизировать, делал вечером) */
  const currentActiveCell = tableActiveRowSelector(newState);

  if (!currentActiveCell) {
    return;
  }

  const currentActiveCellElement: HTMLElement | null = document.querySelector(
    `[data-name="${currentActiveCell.title}"]`,
  );
  const cell: HTMLElement | null = currentActiveCellElement
    ? currentActiveCellElement!.parentElement!.parentElement
    : null;

  if (cell) {
    const previousActiveCell = tableActiveRowSelector(oldState);

    if (previousActiveCell) {
      const previousCellElement: HTMLElement | null = document.querySelector(
        `[data-name="${tableActiveRowSelector(oldState)?.title}"]`,
      );
      const previousCell: HTMLElement | null = previousCellElement
        ? previousCellElement!.parentElement!.parentElement
        : null;

      if (previousCell && previousCell.classList.contains('TableCell_active')) {
        previousCell.classList.remove('TableCell_active');
      }
    }

    cell.classList.add('TableCell_active');
  }
}

const loadHistogramEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch }) => {
  const statePairs$ = state$.pipe(pairwise());

  return action$.pipe(
    ofAction(TableActions.setActiveRow, HistogramActions.setNumberOfRows),
    withLatestFrom(statePairs$),
    filter(() => state$.value.settings.showHistogram),
    tap(() => dispatch(LoaderAction.setLoading('histogram'))),
    distinctUntilChanged(),
    switchMap(([{ payload }, [oldState, newState]]) => {
      toggleActiveTableCellClass(newState, oldState);

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
};

const loadHistogramStatisticEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
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
