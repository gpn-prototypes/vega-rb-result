import { ofAction } from '@app/operators/ofAction';
import { loadArchive } from '@app/services/utilsService';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import { of } from 'rxjs';
import {
  catchError,
  ignoreElements,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { LoaderAction } from '../loader/loaderActions';
import { EpicDependencies, RootState } from '../types';

import { FetchFilePayload, FileAction } from './fileActions';

const fetchResultFileEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  EpicDependencies
> = (action$, state$, { dispatch, projectService }) =>
  action$.pipe(
    ofAction(FileAction.fetchResultFile),
    tap(() => dispatch(LoaderAction.setLoading('file'))),
    switchMap((action: { payload: FetchFilePayload }) =>
      loadArchive(
        action.payload.statistics,
        action.payload.samples,
        action.payload.plots,
      ).pipe(
        tap(() => dispatch(FileAction.fetchResultFileFulfilled())),
        takeUntil(
          action$.ofType(FileAction.stopFetchingFile).pipe(
            tap(() => {
              projectService.abortController.abort();
            }),
            catchError((e) => {
              console.error('Error occured while cancelling request. ', e);

              return of(LoaderAction.setLoaded('file'));
            }),
          ),
        ),
      ),
    ),
    tap(() => dispatch(LoaderAction.setLoaded('file'))),
    ignoreElements(),
  );

export const FileEpics = [fetchResultFileEpic];
