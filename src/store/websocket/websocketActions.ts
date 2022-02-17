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

export const WebsocketAction = {
  setWebsocket: factory<WebsocketPayload>('WEBSOCKET/SET_WEBSOCKET'),
  handleMessage: factory<HandleMessagePayload>('WEBSOCKET/HANDLE_MESSAGE'),
  sendMessage: factory<SendMessagePayload>('WEBSOCKET/SEND_MESSAGE'),
};
