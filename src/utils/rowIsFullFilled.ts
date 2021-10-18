import { filter, flow, map, some } from 'lodash/fp';
import { TableEntities } from "@app/types/enumsTable";
import { Column, Row } from '@app/components/TableResultRbController/TableResultRb/types';

export const rowIsFulfilled = <T = any>(
  row: Row<T>,
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
