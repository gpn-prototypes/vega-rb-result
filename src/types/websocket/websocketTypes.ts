export enum WebsocketDomain {
  CalculationResultArchive = 'CALCULATION_RESULT_ARCHIVE',
}

export enum WebsocketStatus {
  Start = 'START',
  InProgress = 'IN_PROGRESS',
  Complete = 'COMPLETE',
  Error = 'ERROR',
}

export type WebSocketCalculationResultArchiveType =
  | 'CALCULATION_RESULT_ARCHIVE/START'
  | 'CALCULATION_RESULT_ARCHIVE/IN_PROGRESS'
  | 'CALCULATION_RESULT_ARCHIVE/COMPLETE'
  | 'CALCULATION_RESULT_ARCHIVE/ERROR';

export type WebSocketCalculationResultArchiveSendType =
  'CALCULATION_RESULT_ARCHIVE/STOP';

export type WebSocketType = WebSocketCalculationResultArchiveType;

export type WebSocketSendType = WebSocketCalculationResultArchiveSendType;

export type WebSocketDownloadPayload = {
  message: string;
  progress: number;
};

export type WebSocketCompleteDownloadPayload = {
  message: string;
  progress: number;
  // eslint-disable-next-line camelcase
  attachment_url: string;
};

export type VegaWebSocketPayload = {
  'CALCULATION_RESULT_ARCHIVE/START': WebSocketDownloadPayload;
  'CALCULATION_RESULT_ARCHIVE/IN_PROGRESS': WebSocketDownloadPayload;
  'CALCULATION_RESULT_ARCHIVE/COMPLETE': WebSocketCompleteDownloadPayload;
  'CALCULATION_RESULT_ARCHIVE/ERROR': WebSocketDownloadPayload;
};

export type VegaWebSocketSendPayload = {
  'CALCULATION_RESULT_ARCHIVE/STOP': WebSocketDownloadPayload;
};

export type WebSocketMessage = {
  code: WebSocketType;
  payload: VegaWebSocketPayload[WebSocketType];
};

export type WebSocketSendMessage = {
  code: WebSocketSendType;
  payload?: VegaWebSocketSendPayload[WebSocketSendType];
};
