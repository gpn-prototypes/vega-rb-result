import GridColumnEntity from 'components/ExcelTable/Models/GridColumnEntity';
import {
  ProjectStructure,
  ProjectStructureInput,
  VisibleInput,
} from '@app/generated/graphql';
import { SpecialColumns } from '@app/model/Table';
import { CalculationParam, GeoCategory, Risk, TableStructures } from '@app/types';

import { omitTypename } from './omitTypename';
import { constructRows } from './unpackingData';
import {GridCollection, GridColumn, GridRow} from "@app/types/typesTable";
import {TableEntities} from "@app/types/enumsTable";

const getCalculationColumn = (
  prev: GridColumn[],
  { code, shortName, units, decimalPlace }: CalculationParam,
): GridColumn[] => [
  ...prev,
  new GridColumnEntity(
    code,
    units.trim().length ? `${shortName}, ${units}` : shortName,
    TableEntities.CALC_PARAM,
    undefined,
    decimalPlace,
  ),
];

const getCategoryColumn = (
  prev: GridColumn[],
  { code, name, visible }: GeoCategory,
): GridColumn[] => [
  ...prev,
  new GridColumnEntity(
    code,
    name,
    TableEntities.GEO_CATEGORY,
    omitTypename(visible) as VisibleInput,
  ),
];

const getRiskColumn = (
  prev: GridColumn[],
  { code, name }: Risk,
): GridColumn[] => {
  return [...prev, new GridColumnEntity(code, name, TableEntities.RISK)];
};

function structureParamsReducer(list: TableStructures[]): GridColumn[] {
  if (!list.length) return [];

  return list.reduce((prev: GridColumn[], curr: TableStructures) => {
    switch (curr.__typename) {
      case TableEntities.CALC_PARAM:
        return getCalculationColumn(prev, curr as CalculationParam);

      case TableEntities.GEO_CATEGORY:
        return getCategoryColumn(prev, curr as GeoCategory);

      case TableEntities.RISK:
        return getRiskColumn(prev, curr as Risk);

      default:
        return prev;
    }
  }, []);
}

function constructColumns({
  domainEntities = [],
  attributes = [],
  risks = [],
}: ProjectStructureInput): GridColumn[] {
  return [
    new GridColumnEntity(SpecialColumns.ID, undefined, TableEntities.ID),
    ...structureParamsReducer(domainEntities),
    new GridColumnEntity(
      SpecialColumns.GEO_CATEGORY,
      'Кат.',
      TableEntities.GEO_CATEGORY_TYPE,
    ),
    new GridColumnEntity(
      SpecialColumns.SPLITTER,
      undefined,
      TableEntities.SPLITTER,
    ),
    ...structureParamsReducer(attributes),
    new GridColumnEntity(
      SpecialColumns.SPLITTER_RISKS,
      undefined,
      TableEntities.SPLITTER,
    ),
    ...structureParamsReducer(risks),
  ];
}

export function unpackTableData(
  projectStructure: ProjectStructure,
  version: number,
): GridCollection {
  const columns: GridColumn[] = constructColumns(projectStructure);
  const rows: GridRow[] = constructRows(projectStructure);

  return {
    columns,
    rows,
    version,
  };
}
