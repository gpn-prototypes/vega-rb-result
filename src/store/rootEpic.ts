import alertDuck from '@app/store/alertDuck';
import errorsDuck from '@app/store/errorsDuck';
import { FileEpics } from '@app/store/file/fileEpics';
import { HistogramEpics } from '@app/store/histogram/HistogramEpics';
import { HistoryEpics } from '@app/store/history/HistoryEpics';
import projectDuck from '@app/store/projectDuck';
import { TableEpics } from '@app/store/table/TableEpics';
import { WebsocketEpics } from '@app/store/websocket/websocketEpics';
import { combineEpics } from 'redux-observable';

export default combineEpics(
  ...Object.values(alertDuck.epics),
  ...projectDuck.epics,
  ...errorsDuck.epics,
  ...WebsocketEpics,
  ...FileEpics,
  ...HistogramEpics,
  ...TableEpics,
  ...HistoryEpics,
);
