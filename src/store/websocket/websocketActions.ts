import {
  WebSocketMessage,
  WebSocketSendMessage,
} from '@app/types/websocket/websocketTypes';
import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('websocket');

export type WebsocketKeyValue = Record<string, WebSocket>;

export type WebsocketPayload = {
  id: string;
  websocket: WebSocket;
};

export type HandleMessagePayload = {
  id: string;
  message: WebSocketMessage;
};

export type SendMessagePayload = {
  id: string;
  message: WebSocketSendMessage;
};

export interface WebsocketStore {
  instance: WebsocketKeyValue;
}

export const WebsocketActions = {
  setWebsocket: factory<WebsocketPayload>('SET_WEBSOCKET'),
  handleMessage: factory<HandleMessagePayload>('HANDLE_MESSAGE'),
  sendMessage: factory<SendMessagePayload>('SEND_MESSAGE'),
};
