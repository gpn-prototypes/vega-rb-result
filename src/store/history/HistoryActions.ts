import { Location } from 'history';
import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('histogram');

export type HistoryStore = {
  currentLocation: Location<unknown> | null;
};

export const HistoryActions = {
  handleChange: factory<Location<unknown>>('HISTORY/HANDLE_CHANGE'),
  setCurrentLocation: factory<Location<unknown>>(
    'HISTORY/SET_CURRENT_LOCATION',
  ),
};
