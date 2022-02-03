import projectService from '@app/services/ProjectService';
import { applyMiddleware, CombinedState, createStore, Store } from 'redux';
import * as logger from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { AnyAction } from 'typescript-fsa';

import rootReducer from './reducers';
import rootEpic from './rootEpic';
import { EpicDependencies, RootState } from './types';

const configureStore = (): Store<CombinedState<RootState>, AnyAction> => {
  const epicMiddleware = createEpicMiddleware<
    AnyAction,
    AnyAction,
    RootState,
    EpicDependencies
  >({
    dependencies: {
      projectService,

      get dispatch() {
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
