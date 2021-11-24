import {
  Column,
  Row,
} from '@app/components/TableResultRbController/TableResultRb/types';
import { TableEntities } from '@app/types/enumsTable';
import { filter, flow, map, some } from 'lodash/fp';

export const rowIsFulfilled = <T = any>(
  row: Row,
  columns: Column<Row>[],
  tableEntity: TableEntities = TableEntities.GEO_CATEGORY,
): boolean =>
  flow(
    filter(({ type }) => type === tableEntity),
    map(({ accessor, title }: Column<Row>) => ({
      key: accessor,
      name: title,
    })),
    some(({ key }: { key: string }) => Boolean(row[key]?.value)),
  )(columns);
