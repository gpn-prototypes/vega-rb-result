import { TableEntities } from "@app/types/enumsTable";
import { Column, Row } from '@app/components/TableResultRbController/TableResultRb/types';

export const getColumnsByType = (
  list: Column<Row>[],
  type: TableEntities,
): Column<Row>[] => list.filter((column: Column<Row>) => column.type === type);
