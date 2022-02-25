import { ofAction } from '@app/operators/ofAction';
import { loadArchive } from '@app/services/utilsService';
import {
  WebSocketCompleteDownloadPayload,
  WebsocketDomain,
} from '@app/types/websocket/websocketTypes';
import {
  createWebsocket,
  websocketFilterByType,
} from '@app/utils/websocketHelper';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import { from } from 'rxjs';
import { filter, ignoreElements, switchMap, tap } from 'rxjs/operators';

import { LoaderAction } from '../loader/loaderActions';
import { NotifyActions } from '../notify/notifyActions';
import { RootState, StoreDependencies } from '../types';
import { WebsocketAction } from '../websocket/websocketActions';

import { FetchFilePayload, FileAction } from './fileActions';

const fetchResultFileEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch, projectService }) =>
  action$.pipe(
    ofAction(FileAction.fetchResultFile),
    tap(() => dispatch(LoaderAction.setLoading('file'))),
    /** Получаем id, для запроса на websocket */
    switchMap((action: { payload: FetchFilePayload }) => {
      return from(
        projectService.generateCalculationResultArchiveProcessId(
          action.payload.statistics,
          action.payload.samples,
          action.payload.plots,
        ),
      );
    }),
    /**
     * Инициализируем websocket соединение, далее обработка идет по сообщениям
     * из сокета в файле handleCalculationArchiveWebsocketEpic
     */
    switchMap((id) => {
      const { projectId } = projectService;

      dispatch(FileAction.setWebsocketId(id));

      return from(
        createWebsocket({
          id,
          projectId,
          dispatch,
        }),
      );
    }),
    switchMap(() => {
      return action$.pipe(
        ofAction(WebsocketAction.handleMessage),
        filter(({ payload }) =>
          websocketFilterByType(
            WebsocketDomain.CalculationResultArchive,
            payload,
          ),
        ),
        tap(({ payload }) => {
          const { message } = payload;

          switch (message.code) {
            case 'CALCULATION_RESULT_ARCHIVE/START':
              dispatch(
                FileAction.setFileStatus(
                  message.payload.message || 'Начало генерации архива',
                ),
              );

              break;

            case 'CALCULATION_RESULT_ARCHIVE/IN_PROGRESS':
              dispatch(
                FileAction.setFileStatus(
                  `${message.payload.message}. Прогресс: ${message.payload.progress}%`,
                ),
              );

              break;

            case 'CALCULATION_RESULT_ARCHIVE/ERROR':
              dispatch(LoaderAction.setLoaded('file'));

              dispatch(
                NotifyActions.appendItem({
                  key: payload.id,
                  message: message.payload.message,
                  status: 'alert',
                  autoClose: 5,
                  onAutoClose: () =>
                    dispatch(NotifyActions.removeItem(payload.id)),
                }),
              );

              break;

            case 'CALCULATION_RESULT_ARCHIVE/COMPLETE':
              loadArchive(
                (message.payload as WebSocketCompleteDownloadPayload)
                  .attachment_url,
              ).then(() => {
                dispatch(NotifyActions.removeItem(payload.id));
                dispatch(LoaderAction.setLoaded('file'));
              });

              break;

            default:
              break;
          }
        }),
      );
    }),
    ignoreElements(),
  );

export const handleStopFetchingFile: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofAction(FileAction.stopFetchingFile),
    tap(() => {
      dispatch(
        WebsocketAction.sendMessage({
          id: state$.value.file.websocketId,
          message: {
            code: 'CALCULATION_RESULT_ARCHIVE/STOP',
          },
        }),
      );

      dispatch(
        NotifyActions.appendItem({
          key: state$.value.file.websocketId,
          message: 'Успешно остановлено',
          status: 'normal',
          autoClose: 3,
          onAutoClose: () =>
            dispatch(NotifyActions.removeItem(state$.value.file.websocketId)),
        }),
      );
    }),
    ignoreElements(),
  );

export const FileEpics = [fetchResultFileEpic, handleStopFetchingFile];
