import { useSelector } from 'react-redux';

import { RootState } from '@app/store/types';
import { NoopFunction } from '@app/types';
import {GridColumn} from "@app/types/typesTable";

export default function useValidateByColumns<R>(
  validator: NoopFunction<GridColumn[], R>,
): R {
  const columns = useSelector(({ table }: RootState) => table.columns);

  return validator(columns);
}
