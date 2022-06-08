import projectService from '@app/services/ProjectService';
import { isSecureBaseApiUrl } from '@app/services/utils';
import {
  HandleMessagePayload,
  WebsocketActions,
} from '@app/store/websocket/websocketActions';
import {
  WebsocketDomain,
  WebSocketMessage,
} from '@app/types/websocket/websocketTypes';
import { AnyAction, Dispatch } from 'redux';

type InitWebsocketParams = {
  id: string;
  projectId: string;
  dispatch: Dispatch<AnyAction>;
  onmessage?: ({ code, payload }: WebSocketMessage) => void;
  onopen?: () => void;
  onclose?: () => void;
};

export async function createWebsocket({
  id,
  projectId,
  onopen,
  onclose,
  onmessage,
  dispatch,
}: InitWebsocketParams): Promise<WebSocket> {
  const token = await projectService.identity.getToken();

  const protocol = isSecureBaseApiUrl() ? 'wss' : 'ws';

  const ws: WebSocket = new WebSocket(
    `${protocol}://${document.location.hostname}/processes/${projectId}/${id}?authorization=${token}`,
  );

  if (ws) {
    dispatch(
      WebsocketActions.setWebsocket({
        id,
        websocket: ws,
      }),
    );
  }

  if (onopen) {
    ws.onopen = onopen;
  }

  if (onclose) {
    ws.onclose = onclose;
  }

  ws.onmessage = (event) => {
    dispatch(
      WebsocketActions.handleMessage({
        id,
        message: JSON.parse(event.data),
      }),
    );

    if (onmessage) {
      onmessage(event.data);
    }
  };

  return ws;
}

export function websocketFilterByType(
  domain: WebsocketDomain,
  payload: HandleMessagePayload,
): boolean {
  return payload.message.code.indexOf(`${domain}/`) > -1;
}
