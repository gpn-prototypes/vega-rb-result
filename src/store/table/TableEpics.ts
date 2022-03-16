import { ResultProjectStructure } from '@app/generated/graphql';
import { ofAction } from '@app/operators/ofAction';
import { loadDecimalData, setDecimalData } from '@app/services/DecimalService';
import { loadTableData } from '@app/services/loadTableData';
import { DecimalFixed } from '@app/types/typesTable';
import { unpackTableData } from '@app/utils/unpackTableData';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import { from, zip } from 'rxjs';
import {
  distinctUntilChanged,
  ignoreElements,
  switchMap,
  tap,
} from 'rxjs/operators';

import { LoaderAction } from '../loader/loaderActions';
import { RootState, StoreDependencies } from '../types';

import { TableActions } from './tableActions';

const handleInitLoadTableEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch, projectService }) => {
  return action$.pipe(
    ofAction(TableActions.initLoadTable),
    tap(() => dispatch(LoaderAction.setLoading('table'))),
    distinctUntilChanged(),
    switchMap(() => {
      return zip(from(loadTableData()), from(loadDecimalData()));
    }),
    tap(
      ([projectStructure, decimalFixed]: [
        ResultProjectStructure,
        DecimalFixed,
      ]) => {
        if (projectStructure === null) {
          dispatch(TableActions.setNotFound(true));
        } else {
          dispatch(
            TableActions.setEntitiesCount(
              projectStructure.domainEntities.length,
            ),
          );

          const unpackedTableData = unpackTableData(
            projectStructure,
            projectService.version,
            decimalFixed,
          );

          dispatch(TableActions.initState(unpackedTableData));
        }
      },
    ),
    tap(() => dispatch(LoaderAction.setLoaded('table'))),
    ignoreElements(),
  );
};

/**
 * Отлавливаем обновление разрядности
 * Как поймали, отправляем запрос на бекенд, что бы сохранить
 * После этого обновляем стору со справочником decimalFixed
 * И после этого обновляем таблицу
 */
const handleSetDecimalEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch }) => {
  return action$.pipe(
    ofAction(TableActions.initUpdateDecimalFixed),
    tap(() => dispatch(LoaderAction.setLoading('decimal'))),
    distinctUntilChanged(),
    switchMap(({ payload }) => {
      let currentDecimal = state$.value.table.decimalFixed[payload.columnCode];

      const decimalFixed =
        payload.type === 'plus' ? (currentDecimal += 1) : (currentDecimal -= 1);

      const cloneDecimal = { ...state$.value.table.decimalFixed };

      cloneDecimal[payload.columnCode] = currentDecimal;

      dispatch(TableActions.setDecimalFixed(cloneDecimal));

      return from(setDecimalData(payload.columnCode, decimalFixed));
    }),
    tap(() => {
      dispatch(TableActions.updateDecimal());
      dispatch(LoaderAction.setLoaded('decimal'));
    }),
    ignoreElements(),
  );
};

export const TableEpics = [handleInitLoadTableEpic, handleSetDecimalEpic];
