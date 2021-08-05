import { ClearActionTypes } from './action-types';

type ClearStores = {
  type: typeof ClearActionTypes.CLEAR_STORES;
};

export const clearStores = (): ClearStores => {
  return {
    type: ClearActionTypes.CLEAR_STORES,
  };
};
