import alertDuck from '@app/store/alertDuck';
import errorsDuck from '@app/store/errorsDuck';
import histogramDuck from '@app/store/histogramDuck';
import projectDuck from '@app/store/projectDuck';
import tableDuck from '@app/store/tableDuck';
import treeDuck from '@app/store/treeDuck';
import { combineReducers } from 'redux';

import competitiveAccessDuck from './competitiveAccessDuck';
import sensitiveAnalysisDuck from './sensitiveAnalysisDuck';
import { RootState } from './types';

export default combineReducers<RootState>({
  alert: alertDuck.reducer,
  competitiveAccess: competitiveAccessDuck.reducer,
  errors: errorsDuck.reducer,
  project: projectDuck.reducer,
  table: tableDuck.reducer,
  tree: treeDuck.reducer,
  histograms: histogramDuck.reducer,
  sensitiveAnalysis: sensitiveAnalysisDuck.reducer,
});
