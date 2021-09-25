import React, { ComponentType, ReactText } from 'react';
//TODO delete react-data-grid (copy from rb, used as sample)
import {
  CalculatedColumn,
  CellRendererProps,
  Column,
  EditorProps as CommonEditorProps,
  FormatterProps,
  HeaderRendererProps as BaseHeaderRendererProps,
} from 'react-data-grid';
import {
  DistributionDefinitionTypes,
  DistributionParameterTypes,
  DistributionTypes,
  GeoObjectCategories,
  RbErrorInterface,
  TableError,
} from '@app/generated/graphql';
import {CategoryIcon, TableEntities, VisibleKeys} from "@app/types/enumsTable";

export class OptionEntity implements DropDownOption {
  private readonly _id: GeoObjectCategories;

  private readonly _value: GeoObjectCategories;

  text: string;

  constructor(id: GeoObjectCategories, text: string) {
    this._id = id;
    this._value = id;
    this.text = text;
  }

  get id(): GeoObjectCategories {
    return this._id;
  }

  get value(): GeoObjectCategories {
    return this._value;
  }

  toString(): string {
    return this.text;
  }
}

export const entitiesOptions = {
  RESOURCE: new OptionEntity(GeoObjectCategories.Resources, 'Ресурсы'),
  RESERVES: new OptionEntity(GeoObjectCategories.Reserves, 'Запасы'),
};

interface EditorOptions {
  editOnClick: boolean;
}

export class GridColumnEntity implements GridColumn {
  readonly key: string;

  name: string;

  type: TableEntities;

  decimalPlace: number | undefined;

  visible: VisibilityProperties;

  editorOptions: EditorOptions | undefined;

  constructor(
    key: string,
    name = '',
    type: TableEntities = TableEntities.NONE,
    visible = {
      calc: true,
      table: true,
      tree: true,
    },
    decimalPlace?: number,
    editorOptions?: EditorOptions,
  ) {
    this.key = key;
    this.name = name;
    this.type = type;
    this.visible = visible;
    this.decimalPlace = decimalPlace;
    this.editorOptions = editorOptions;
  }
}

export type ErrorWrapper = { [index: string]: TableError };

export type ColumnErrors = { [index: string]: ErrorWrapper };

export type SelectedCell = {
  rowIdx: number;
  row: GridRow;
  column: GridColumn;
};

export type VisibilityProperties = {
  [key in VisibleKeys]: boolean;
};

export interface GridCellParameters {
  value: ReactText;
  type: DistributionParameterTypes;
}

export interface GridCellArguments {
  type: DistributionTypes;
  definition: DistributionDefinitionTypes;
  parameters: GridCellParameters[];
  minBound?: number;
  maxBound?: number;
}

export interface DropDownOption {
  id: string;
  value: GeoObjectCategories;
  text: string;
}

export interface GridCell {
  selectedCell: SelectedCell;
  cellData: GridCellProperties;
}

export interface GridCellProperties {
  value: ReactText | DropDownOption;
  args?: GridCellArguments;
}

export interface GridRow {
  [columnKey: string]: GridCellProperties | undefined;
}

export interface GridColumn extends Column<GridRow> {
  key: string;
  name?: string;
  type?: TableEntities;
  code?: string;
  decimalPlace?: number;
  icon?: CategoryIcon;
  hasIcon?: boolean;
  isRenaming?: boolean;
  before?: JSX.Element;
  headerId?: string;
  notRemovable?: boolean;
  visible?: VisibilityProperties;
  cellRenderer?: React.ComponentType<CellRendererProps<GridRow>>;
  error?: RbErrorInterface;
}

export interface GridCollection {
  columns: GridColumn[];
  rows: GridRow[];
  version: number;
}

export interface FilteredGridDataKeys {
  columnsKeys: string[];
  rowsKeys: string[];
}

export interface ContextBody {
  key: string;
}

export interface ColumnContextBody extends ContextBody {
  type: TableEntities;
  decimalPlace?: number;
}

export interface RowContextBody extends ContextBody {
  element: GridRow;
}

export type ContextHandler<T extends ContextBody> = (
  e: React.MouseEvent<HTMLDivElement>,
  { key }: T,
) => void;

export type BaseProps = {
  formatter: ComponentType<FormatterProps<GridRow>>;
  headerRenderer: ComponentType<BaseHeaderRendererProps<GridRow>>;
};

export type UniColumn = CalculatedColumn<GridRow> & GridColumn;

export interface DropdownOption {
  id: string;
  value: string;
  text: string;
}

export interface DropDownEditorProps
  extends CommonEditorProps<GridRow | undefined> {
  options: { [index: string]: DropdownOption };
}

type EditorProps = CommonEditorProps<GridRow | undefined> | DropDownEditorProps;

export type EditorResult = {
  editor?: ComponentType<EditorProps>;
};

export type ColumnProperties = Partial<
  Record<keyof GridColumn, string | number | boolean>
>;

export type SetColumnProperties = (
  key: string,
  properties: ColumnProperties,
) => void;

export interface HeaderRendererProps extends BaseHeaderRendererProps<GridRow> {
  column: UniColumn;
  setColumnProps: SetColumnProperties;
  handleColumnsReorder: (sourceKey: string, targetKey: string) => void;
}

export interface OnRowClickArgs {
  rowIdx: number;
  row: GridRow;
  column: UniColumn;
}

export type OnRowClick = (args: OnRowClickArgs) => void;

export interface RowsToUpdate {
  column?: CalculatedColumn<GridRow>;
  rowsKeys?: string[];
}

export interface Position {
  idx: number;
  rowIdx: number;
}
