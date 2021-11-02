import { Item } from '@consta/uikit/SnackBar';
import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('settings');

export interface NotifyStore {
  items: Item[];
}

export const NotifyActions = {
  resetState: factory('RESET_STATE'),
  removeItem: factory<string>('REMOVE_ITEM'),
  appendItem: factory<Item>('APPEND_ITEM'),
  appendItems: factory<Item[]>('APPEND_ITEMS'),
  setItems: factory<Item[]>('SET_ITEMS'),
};
