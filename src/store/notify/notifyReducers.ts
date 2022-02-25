import { Item } from '@consta/uikit/__internal__/src/components/SnackBar/helper';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { NotifyActions, NotifyStore } from './notifyActions';

export const notifyInitialState: NotifyStore = {
  items: [],
};

export const NotifyReducers = reducerWithInitialState<NotifyStore>(
  notifyInitialState,
)
  .case(NotifyActions.resetState, () => notifyInitialState)
  .case(NotifyActions.appendItem, (state: NotifyStore, item: Item) => {
    const cloneItems = [...state.items];

    cloneItems.push(item);

    return {
      ...state,
      items: cloneItems,
    };
  })
  .case(NotifyActions.appendItems, (state: NotifyStore, items: Item[]) => {
    return {
      ...state,
      items: [...state.items, ...items],
    };
  })
  .case(NotifyActions.setItems, (state: NotifyStore, items: Item[]) => {
    return {
      ...state,
      items,
    };
  })
  .case(NotifyActions.removeItem, (state: NotifyStore, key: string) => {
    return {
      ...state,
      items: state.items.filter((item: Item) => item.key !== key),
    };
  });
