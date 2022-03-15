import alertDuck from '@app/store/alertDuck';
import competitiveAccessDuck from '@app/store/competitiveAccessDuck';
import errorsDuck from '@app/store/errorsDuck';
import { FileReducers } from '@app/store/file/fileReducers';
import { GeneralReducers } from '@app/store/general/generalReducers';
import { HistogramReducers } from '@app/store/histogram/HistogramReducers';
import { HistoryReducers } from '@app/store/history/HistoryReducers';
import { LoaderReducers } from '@app/store/loader/loaderReducers';
import { NotifyReducers } from '@app/store/notify/notifyReducers';
import projectDuck from '@app/store/projectDuck';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';
import { SettingsReducers } from '@app/store/settings/settingsReducers';
import { TableReducers } from '@app/store/table/tableReducers';
import treeDuck from '@app/store/treeDuck';
import { RootState } from '@app/store/types';
import { WebsocketReducers } from '@app/store/websocket/websocketReducers';
import { combineReducers } from 'redux';

export default combineReducers<RootState>({
  alert: alertDuck.reducer,
  competitiveAccess: competitiveAccessDuck.reducer,
  errors: errorsDuck.reducer,
  project: projectDuck.reducer,
  table: TableReducers,
  tree: treeDuck.reducer,
  histogram: HistogramReducers,
  sensitiveAnalysis: sensitiveAnalysisDuck.reducer,
  settings: SettingsReducers,
  notify: NotifyReducers,
  websocket: WebsocketReducers,
  general: GeneralReducers,
  loader: LoaderReducers,
  file: FileReducers,
  history: HistoryReducers,
});
