import {
  ProjectStructure, ProjectStructureInput, RbResultDomainEntityInput,
} from '../generated/graphql';
import { GridCollection } from '../types/typesTable';
import { Column, Row } from '../components/TableResultRbController/TableResultRb/types';
import { constructRows } from './unpackingData';
  
// const getCalculationColumn = (
//   prev: Column[],
//   { code, shortName, units, decimalPlace }: CalculationParam,
// ): Column[] => [
//   ...prev,
//   ...[{
//     id: code,
//     accessor: code,
//     name: units.trim().length ? `${shortName}, ${units}` : shortName,
//     type: TableEntities.CALC_PARAM,
//   }],
// ];

// const getCategoryColumn = (
//   prev: Column[],
//   { code, name, visible }: GeoCategory,
// ): Column[] => [
//   ...prev,
//   new ColumnEntity(
//     code,
//     name,
//     TableEntities.GEO_CATEGORY,
//     omitTypename(visible) as VisibleInput,
//   ),
// ];

// const getRiskColumn = (
//   prev: Column[],
//   { code, name }: Risk,
// ): Column[] => {
//   return [...prev, new ColumnEntity(code, name, TableEntities.RISK)];
// };

// function structureParamsReducer(list: TableStructures[]): Column[] {
//   if (!list.length) return [];

//   return list.reduce((prev: Column[], curr: TableStructures) => {
//     switch (curr.__typename) {
//       case TableEntities.CALC_PARAM:
//         return getCalculationColumn(prev, curr as CalculationParam);

//       case TableEntities.GEO_CATEGORY:
//         return getCategoryColumn(prev, curr as GeoCategory);

//       case TableEntities.RISK:
//         return getRiskColumn(prev, curr as Risk);

//       default:
//         return prev;
//     }
//   }, []);
// }

function constructColumns({
  domainEntities = [],
  attributes = [],
  risks = [],
}: ProjectStructureInput): Column<RbResultDomainEntityInput>[] {
  /** TODO: Доработать логикой */
  return domainEntities.map((domainEntity: RbResultDomainEntityInput) => {
    const column: Column<RbResultDomainEntityInput> = {
      title: domainEntity.name,
      accessor: domainEntity.code as keyof RbResultDomainEntityInput,
      sortable: true,
    };

    return column;
  });
}
  
export function unpackTableData(
  projectStructure: ProjectStructure,
  version: number,
): GridCollection {
  const columns: Column<RbResultDomainEntityInput>[] = constructColumns(projectStructure);
  const rows: Row<RbResultDomainEntityInput>[] = constructRows(projectStructure);

  return {
    columns,
    rows,
    version,
  };
}
