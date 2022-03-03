import alertDuck from '@app/store/alertDuck';
import errorsDuck from '@app/store/errorsDuck';
import { FileEpics } from '@app/store/file/fileEpics';
import { HistogramEpics } from '@app/store/histogram/HistogramEpics';
import projectDuck from '@app/store/projectDuck';
import { combineEpics } from 'redux-observable';

export default combineEpics(
  ...Object.values(alertDuck.epics),
  ...projectDuck.epics,
  ...errorsDuck.epics,
  ...FileEpics,
  ...HistogramEpics,
);
