import { ofAction } from '@app/operators/ofAction';
import { RootState, StoreDependencies } from '@app/store/types';
import { AnyAction } from 'redux';
import { Epic } from 'redux-observable';
import { ignoreElements, tap } from 'rxjs/operators';

import { WebsocketAction } from '../websocketActions';

export const handleSendWebsocketEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  StoreDependencies
> = (action$, state$) =>
  action$.pipe(
    ofAction(WebsocketAction.sendMessage),
    tap(({ payload }) => {
      state$.value.websocket.instance[payload.id].send(
        JSON.stringify(payload.message),
      );
    }),
    ignoreElements(),
  );
