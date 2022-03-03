import alertDuck from '@app/store/alertDuck';
import errorsDuck from '@app/store/errorsDuck';
import { FileEpics } from '@app/store/file/fileEpics';
import { HistogramEpics } from '@app/store/histogram/HistogramEpics';
import projectDuck from '@app/store/projectDuck';
import { WebsocketEpics } from '@app/store/websocket/websocketEpics';
import { combineEpics } from 'redux-observable';

export default combineEpics(
  ...Object.values(alertDuck.epics),
  ...projectDuck.epics,
  ...errorsDuck.epics,
  ...WebsocketEpics,
  ...FileEpics,
  ...HistogramEpics,
);
