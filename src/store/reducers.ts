import { combineReducers } from 'redux';
import alertDuck from '@app/store/alertDuck';
import errorsDuck from '@app/store/errorsDuck';
import projectDuck from '@app/store/projectDuck';
import tableDuck from '@app/store/tableDuck';
import treeDuck from '@app/store/treeDuck';

import competitiveAccessDuck from './competitiveAccessDuck';
import { RootState } from './types';

export default combineReducers<RootState>({
  alert: alertDuck.reducer,
  competitiveAccess: competitiveAccessDuck.reducer,
  errors: errorsDuck.reducer,
  project: projectDuck.reducer,
  table: tableDuck.reducer,
  tree: treeDuck.reducer,
});
