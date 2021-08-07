import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { persistStore } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';

import projectStructureReducer from './project-structure/reducer';

import { StoreRES } from '@app/types/redux-store';

const rootReducer = combineReducers({
  projectStructure: projectStructureReducer,
});

export const getStore = (initialState?: StoreRES): Store =>
  createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware.withExtraArgument({}))),
  );

export const store = getStore();

export const persistor = persistStore(store);
