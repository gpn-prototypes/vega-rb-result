import { filter, flow, map, some } from 'lodash/fp';
import {GridColumn, GridRow} from "@app/types/typesTable";
import {TableEntities} from "@app/types/enumsTable";

export const rowIsFulfilled = (
  row: GridRow,
  columns: GridColumn[],
  tableEntity: TableEntities = TableEntities.GEO_CATEGORY,
): boolean =>
  flow(
    filter(({ type }) => type === tableEntity),
    map(({ key, name }: GridColumn) => ({
      key,
      name,
    })),
    some(({ key }: { key: string }) => Boolean(row[key]?.value)),
  )(columns);
