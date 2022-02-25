import { ofAction } from '@app/operators/ofAction';
import { RootState, StoreDependencies } from '@app/store/types';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import { ignoreElements, tap } from 'rxjs/operators';

import { WebsocketAction } from '../websocketActions';

function isNotClose(websocket: WebSocket): boolean {
  return websocket.readyState !== 3 && websocket.readyState !== 2;
}

export const handleSendWebsocketEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$) =>
  action$.pipe(
    ofAction(WebsocketAction.sendMessage),
    tap(({ payload }) => {
      const currentWebsocket: WebSocket | undefined =
        state$.value.websocket.instance[payload.id];

      if (currentWebsocket && isNotClose(currentWebsocket)) {
        currentWebsocket.send(JSON.stringify(payload.message));

        currentWebsocket.close();
      }
    }),
    ignoreElements(),
  );
