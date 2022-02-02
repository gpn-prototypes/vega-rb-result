import { ofAction } from '@app/operators/ofAction';
import { loadArchive } from '@app/services/utilsService';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import { from } from 'rxjs';
import { ignoreElements, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { LoaderAction } from '../loader/loaderActions';
import { RootState } from '../types';

import { FetchFilePayload, FileAction } from './fileActions';

// TODO ? Epic<AnyAction, AnyAction, RootState>
const fetchResultFileEpic: Epic<any, AnyAction, RootState> = (
  action$,
  state$,
  { dispatch },
) =>
  action$.pipe(
    ofAction(FileAction.fetchResultFile),
    tap(() => dispatch(LoaderAction.setLoading('file'))),
    switchMap((action: { payload: FetchFilePayload }) =>
      from(loadArchive(action.payload.statistics, action.payload.samples)).pipe(
        map((response) =>
          dispatch(FileAction.fetchResultFileFulfilled(response)),
        ),
        takeUntil(action$.ofType(FileAction.stopFetchingFile)),
      ),
    ),
    tap(() => dispatch(LoaderAction.setLoaded('file'))),
    ignoreElements(),
  );

export const FileEpics = [fetchResultFileEpic];
