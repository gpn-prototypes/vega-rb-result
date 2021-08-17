import { combineEpics } from 'redux-observable';
import alertDuck from '@app/store/alertDuck';
import errorsDuck from '"@app/store/errorsDuck';
import projectDuck from '@app/store/projectDuck';
import tableDuck from '@app/store/tableDuck';

export default combineEpics(
  ...Object.values(alertDuck.epics),
  ...projectDuck.epics,
  ...tableDuck.epics,
  ...errorsDuck.epics,
);
