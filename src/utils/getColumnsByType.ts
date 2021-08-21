import {GridColumn} from "@app/types/typesTable";
import {TableEntities} from "@app/types/enumsTable";

export const getColumnsByType = (
  list: GridColumn[],
  type: TableEntities,
): GridColumn[] => list.filter((column: GridColumn) => column.type === type);
