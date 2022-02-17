import projectService from '@app/services/ProjectService';
import { createBrowserHistory } from 'history';
import {
  applyMiddleware,
  CombinedState,
  createStore,
  Dispatch,
  Store,
} from 'redux';
import * as logger from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { AnyAction } from 'typescript-fsa';

import rootReducer from './reducers';
import rootEpic from './rootEpic';
import { RootState, StoreDependencies } from './types';

const configureStore = (): Store<CombinedState<RootState>, AnyAction> => {
  const history = createBrowserHistory();

  const epicMiddleware = createEpicMiddleware<
    AnyAction,
    AnyAction,
    RootState,
    StoreDependencies
  >({
    dependencies: {
      projectService,

      history,

      get dispatch(): Dispatch<AnyAction> {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return store.dispatch;
      },
    },
  });

  const middleware =
    process.env.NODE_ENV === 'development'
      ? [epicMiddleware, logger.createLogger()]
      : [epicMiddleware];

  const store = createStore(rootReducer, applyMiddleware(...middleware));

  epicMiddleware.run(rootEpic);

  return store;
};

export default configureStore();
