import { useSelector } from 'react-redux';
import { Column } from '@app/components/TableResultRbController/TableResultRb/types';
import { RootState } from '@app/store/types';
import { NoopFunction } from '@app/types';

export default function useValidateByColumns<R>(
  validator: NoopFunction<Column[], R>,
): R {
  const columns = useSelector(({ table }: RootState) => table.columns);

  return validator(columns);
}
