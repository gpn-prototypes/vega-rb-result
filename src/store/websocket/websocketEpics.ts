import { handleCalculationArchiveMessageEpic } from './epics/handleCalculationArchiveWebsocketEpic';
import { handleSendWebsocketEpic } from './epics/sendWebsocketEpic';

export const WebsocketEpics = [
  handleCalculationArchiveMessageEpic,
  handleSendWebsocketEpic,
];
