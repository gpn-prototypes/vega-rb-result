import { reducerWithInitialState } from 'typescript-fsa-reducers';

import {
  WebsocketAction,
  WebsocketKeyValue,
  WebsocketPayload,
  WebsocketStore,
} from './websocketActions';

export const websocketStoreInitialState: WebsocketStore = {
  instance: {} as WebsocketKeyValue,
};

export const WebsocketReducers = reducerWithInitialState<WebsocketStore>(
  websocketStoreInitialState,
).case(WebsocketAction.setWebsocket, (state, payload: WebsocketPayload) => {
  const cloneState = { ...state };

  cloneState.instance[payload.id] = payload.websocket;

  return cloneState;
});
