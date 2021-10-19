import { useSelector } from 'react-redux';
import { Column } from '@app/components/TableResultRbController/TableResultRb/types';
import { RbDomainEntityInput } from '@app/generated/graphql';
import { RootState } from '@app/store/types';
import { NoopFunction } from '@app/types';

export default function useValidateByColumns<R>(
  validator: NoopFunction<Column<RbDomainEntityInput>[], R>,
): R {
  const columns = useSelector(({ table }: RootState) => table.columns);

  return validator(columns);
}
