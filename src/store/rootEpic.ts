import { combineEpics } from 'redux-observable';
import alertDuck from '@app/store/alertDuck';
import errorsDuck from '@app/store/errorsDuck';
import projectDuck from '@app/store/projectDuck';

export default combineEpics(
  ...Object.values(alertDuck.epics),
  ...projectDuck.epics,
  ...errorsDuck.epics,
);
