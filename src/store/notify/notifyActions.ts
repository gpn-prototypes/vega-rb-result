import { SnackBarItemDefault } from '@consta/uikit/SnackBar';
import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('settings');

export interface NotifyStore {
  items: SnackBarItemDefault[];
}

export const NotifyActions = {
  resetState: factory('RESET_STATE'),
  removeItem: factory<string>('REMOVE_ITEM'),
  appendItem: factory<SnackBarItemDefault>('APPEND_ITEM'),
  appendItems: factory<SnackBarItemDefault[]>('APPEND_ITEMS'),
  setItems: factory<SnackBarItemDefault[]>('SET_ITEMS'),
};
