import React, { ReactText } from 'react';
import {
  Column,
  Row,
} from '@app/components/TableResultRbController/TableResultRb/types';
import { EFluidType } from '@app/constants/Enums';
import {
  DistributionDefinitionTypes,
  DistributionParameterTypes,
  DistributionTypes,
  GeoObjectCategories,
  RbDomainEntityInput,
  TableError,
} from '@app/generated/graphql';
import { TableEntities, VisibleKeys } from '@app/types/enumsTable';

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

export type ErrorWrapper = { [index: string]: TableError };

export type ColumnErrors = { [index: string]: ErrorWrapper };

export type SelectedCell<T = any> = {
  rowIdx: number;
  row: GridRow;
  column: Column<T>;
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

export interface GridActiveRow {
  code: string;
  title: string;
}

export type DecimalFixed = Record<string, number>;
export type HiddenColumns = Record<string, boolean>;

export interface GridCollection {
  columns: Column<RbDomainEntityInput>[];
  actualColumns?: Column<RbDomainEntityInput>[];
  rows: Row<RbDomainEntityInput>[];
  version: number;
  activeRow?: GridActiveRow | undefined;
  sidebarRow?: GridActiveRow | undefined;
  fluidType?: EFluidType;
  decimalFixed?: DecimalFixed;
  hiddenColumns?: HiddenColumns;
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

export interface DropdownOption {
  id: string;
  value: string;
  text: string;
}

export interface OnRowClickArgs<T = any> {
  rowIdx: number;
  row: GridRow;
  column: Column<T>;
}

export type OnRowClick = (args: OnRowClickArgs) => void;

export interface RowsToUpdate<T = any> {
  column?: Column<T>;
  rowsKeys?: string[];
}

export interface Position {
  idx: number;
  rowIdx: number;
}
