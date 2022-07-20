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

import { LoaderActions } from '../loader/loaderActions';
import { NotifyActions } from '../notify/notifyActions';
import { RootState, StoreDependencies } from '../types';
import { WebsocketActions } from '../websocket/websocketActions';

import { FetchFilePayload, FileActions } from './fileActions';

const fetchResultFileEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch, projectService }) =>
  action$.pipe(
    ofAction(FileActions.fetchResultFile),
    tap(() => dispatch(LoaderActions.setLoading('file'))),
    /** Получаем id, для запроса на websocket */
    switchMap((action: { payload: FetchFilePayload }) => {
      return from(
        projectService.generateCalculationResultArchiveProcessId(
          action.payload.statistics,
          action.payload.projectData,
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

      dispatch(FileActions.setWebsocketId(id));

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
        ofAction(WebsocketActions.handleMessage),
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
                FileActions.setFileStatus(
                  message.payload.message || 'Начало генерации архива',
                ),
              );

              break;

            case 'CALCULATION_RESULT_ARCHIVE/IN_PROGRESS':
              dispatch(
                FileActions.setFileStatus(
                  `${message.payload.message}. Прогресс: ${message.payload.progress}%`,
                ),
              );

              if (
                state$.value.file.downloadArchiveModal.isClosed &&
                state$.value.file.downloadArchiveModal.allowNotifications
              ) {
                dispatch(
                  NotifyActions.appendItem({
                    key: payload.id,
                    message: `Экспорт результата расчёта ${message.payload.progress}%`,
                    onClose: () => {
                      dispatch(
                        FileActions.setDownloadArchiveModalMode({
                          ...state$.value.file.downloadArchiveModal,
                          allowNotifications: false,
                        }),
                      );

                      dispatch(NotifyActions.removeItem(payload.id));
                    },
                    status: 'success',
                    autoClose: false,
                  }),
                );
              }

              break;

            case 'CALCULATION_RESULT_ARCHIVE/ERROR':
              dispatch(LoaderActions.setLoaded('file'));

              dispatch(
                NotifyActions.appendItem({
                  key: payload.id,
                  message: message.payload.message,
                  status: 'alert',
                  autoClose: 3,
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
                dispatch(
                  NotifyActions.appendItem({
                    key: 'success',
                    message: 'Файл расчёта сохранён на компьютер',
                    status: 'success',
                    onClose: () =>
                      dispatch(NotifyActions.removeItem('success')),
                    autoClose: 3,
                  }),
                );
                dispatch(NotifyActions.removeItem(payload.id));
                dispatch(LoaderActions.setLoaded('file'));
                dispatch(LoaderActions.resetType('file'));
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
    ofAction(FileActions.stopFetchingFile),
    tap(() => {
      dispatch(
        WebsocketActions.sendMessage({
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
