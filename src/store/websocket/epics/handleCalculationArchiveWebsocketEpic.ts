import { ofAction } from '@app/operators/ofAction';
import { loadArchive } from '@app/services/utilsService';
import { NotifyActions } from '@app/store/notify/notifyActions';
import { RootState, StoreDependencies } from '@app/store/types';
import {
  WebSocketCompleteDownloadPayload,
  WebsocketDomain,
} from '@app/types/websocket/websocketTypes';
import { websocketFilterByType } from '@app/utils/websocketHelper';
import { SnackBarPropItemAction } from '@consta/uikit/SnackBar';
import { AnyAction, Dispatch } from 'redux';
import { Epic } from 'redux-observable';
import { filter, ignoreElements, tap } from 'rxjs/operators';

import { HandleMessagePayload, WebsocketAction } from '../websocketActions';

const stopWebsocket = (
  dispatch: Dispatch<AnyAction>,
  payload: HandleMessagePayload,
): void => {
  dispatch(
    WebsocketAction.sendMessage({
      id: payload.id,
      message: {
        code: 'CALCULATION_RESULT_ARCHIVE/STOP',
      },
    }),
  );
  dispatch(
    NotifyActions.appendItem({
      key: payload.id,
      message: 'Успешно отменено',
      autoClose: 3,
      onAutoClose: () => dispatch(NotifyActions.removeItem(payload.id)),
      status: 'success',
    }),
  );
};

const getCloseAction = (
  dispatch: Dispatch<AnyAction>,
  payload: HandleMessagePayload,
): SnackBarPropItemAction => {
  return {
    label: 'Отмена',
    onClick: () => stopWebsocket(dispatch, payload),
  };
};

export const handleCalculationArchiveMessageEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofAction(WebsocketAction.handleMessage),
    filter(({ payload }) =>
      websocketFilterByType(WebsocketDomain.CalculationResultArchive, payload),
    ),
    tap(({ payload }) => {
      const { message } = payload;

      switch (message.code) {
        case 'CALCULATION_RESULT_ARCHIVE/START':
          dispatch(
            NotifyActions.appendItem({
              key: payload.id,
              message: message.payload.message || 'Начало генерации архива',
              status: 'system',
              actions: [getCloseAction(dispatch, payload)],
            }),
          );

          break;

        case 'CALCULATION_RESULT_ARCHIVE/IN_PROGRESS':
          dispatch(
            NotifyActions.appendItem({
              key: payload.id,
              message: `${message.payload.message}. Прогресс: ${message.payload.progress}%`,
              status: 'system',
              actions: [getCloseAction(dispatch, payload)],
            }),
          );

          break;

        case 'CALCULATION_RESULT_ARCHIVE/ERROR':
          dispatch(
            NotifyActions.appendItem({
              key: payload.id,
              message: message.payload.message,
              status: 'alert',
            }),
          );

          break;

        case 'CALCULATION_RESULT_ARCHIVE/COMPLETE':
          dispatch(
            NotifyActions.appendItem({
              key: payload.id,
              message: message.payload.message,
              status: 'success',
              actions: [
                {
                  label: 'Скачать архив',
                  onClick: () => {
                    dispatch(NotifyActions.removeItem(payload.id));

                    loadArchive(
                      (message.payload as WebSocketCompleteDownloadPayload)
                        .attachment_url,
                    );
                  },
                },
              ],
            }),
          );

          break;

        default:
          break;
      }
    }),
    ignoreElements(),
  );
