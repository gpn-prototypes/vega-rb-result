import { reducerWithInitialState } from 'typescript-fsa-reducers';

import {
  WebsocketActions,
  WebsocketKeyValue,
  WebsocketPayload,
  WebsocketStore,
} from './websocketActions';

export const websocketStoreInitialState: WebsocketStore = {
  instance: {} as WebsocketKeyValue,
};

export const WebsocketReducers = reducerWithInitialState<WebsocketStore>(
  websocketStoreInitialState,
).case(WebsocketActions.setWebsocket, (state, payload: WebsocketPayload) => {
  const cloneState = { ...state };

  cloneState.instance[payload.id] = payload.websocket;

  return cloneState;
});
