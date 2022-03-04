import { GridActiveRow } from '@app/types/typesTable';

import { RootState } from '../types';

export function tableActiveRowSelector(
  state: RootState,
): GridActiveRow | undefined {
  return state.table.activeRow;
}
