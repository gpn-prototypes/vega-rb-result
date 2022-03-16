import { Location } from 'history';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { HistoryActions, HistoryStore } from './HistoryActions';

export const historyInitialState: HistoryStore = {
  currentLocation: null,
};

export const HistoryReducers = reducerWithInitialState<HistoryStore>(
  historyInitialState,
).case(
  HistoryActions.setCurrentLocation,
  (state, currentLocation: Location<unknown>) => ({
    ...state,
    ...{
      currentLocation,
    },
  }),
);
