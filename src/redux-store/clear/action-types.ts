import { applyActionTypesNames } from '@/utils/apply-action-types-names';

export type ClearActions = 'CLEAR_STORES';

const ClearActionTypes: Record<ClearActions, string> = {
  CLEAR_STORES: '',
};

applyActionTypesNames(ClearActionTypes, 'Clear');

export { ClearActionTypes };
