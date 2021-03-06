import { ofAction } from '@app/operators/ofAction';
import { Location } from 'history';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import {
  distinctUntilChanged,
  filter,
  ignoreElements,
  tap,
} from 'rxjs/operators';
import { Action } from 'typescript-fsa';

import { GeneralActions } from '../general/generalActions';
import { HistogramActions } from '../histogram/HistogramActions';
import { LoaderActions } from '../loader/loaderActions';
import { NotifyActions } from '../notify/notifyActions';
import { SettingsActions } from '../settings/settingsActions';
import { TableActions } from '../table/tableActions';
import treeDuck from '../treeDuck';
import { RootState, StoreDependencies } from '../types';

import { HistoryActions } from './HistoryActions';

function isSamePath(
  previous: Action<Location<unknown>>,
  next: Action<Location<unknown>>,
): boolean {
  const previousPath = previous.payload.pathname;
  const nextPath = next.payload.pathname;

  return previousPath === nextPath;
}

/**
 * Отлавливаем выход из результатов расчета
 * И делаем ресет сторы
 */
const handleChangeLocationEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch }) => {
  return action$.pipe(
    ofAction(HistoryActions.handleChange),
    distinctUntilChanged(isSamePath),
    filter(({ payload }) => payload.pathname.indexOf('/rb-result') === -1),
    tap(() => {
      dispatch(NotifyActions.resetState());
      dispatch(GeneralActions.resetState());
      dispatch(SettingsActions.resetState());
      dispatch(treeDuck.actions.resetState());
      dispatch(TableActions.resetState());
      dispatch(HistogramActions.resetState());
      dispatch(LoaderActions.resetStore());
    }),
    ignoreElements(),
  );
};

export const HistoryEpics = [handleChangeLocationEpic];
