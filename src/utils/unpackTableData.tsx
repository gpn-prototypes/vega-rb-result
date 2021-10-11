import {
  ProjectStructure,
  ResultProjectStructure,
  ProjectStructureInput,
  RbDomainEntityInput,
  ResultDomainEntity,
  ResultAttribute,
} from '../generated/graphql';
import { GridCollection } from '../types/typesTable';
import {
  Column,
  Row,
} from '../components/TableResultRbController/TableResultRb/types';
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
}: ProjectStructureInput): Column<RbDomainEntityInput>[] {
  /** TODO: Доработать логикой */
  return domainEntities.map((domainEntity: RbDomainEntityInput) => {
    const column: Column<RbDomainEntityInput> = {
      title: domainEntity.name,
      accessor: domainEntity.code as keyof RbDomainEntityInput,
      sortable: true,
    };

    return column;
  });
}

export function unpackTableData(
  projectStructure: ResultProjectStructure,
  version: number,
): GridCollection {
  const columns: Column<RbDomainEntityInput>[] = prepareColumns(projectStructure);
  const rows: Row<RbDomainEntityInput>[] = prepareRows(projectStructure);
  // const columns: Column<RbResultDomainEntityInput>[] = constructColumns(projectStructure);
  // const rows: Row<RbResultDomainEntityInput>[] =
  //   constructRows(projectStructure);

  console.log('columns', columns);
  console.log('rows', rows);

  return {
    columns,
    rows,
    version,
  };
}

export const prepareColumns = (
  data: ResultProjectStructure,
): Column<RbDomainEntityInput>[] => {
  const { domainEntities, attributes } = data;

  const preparedEntities = domainEntities.map((domainEntity: ResultDomainEntity) => {
    const column: Column<RbDomainEntityInput> = {
      title: domainEntity.name,
      accessor: domainEntity.code as keyof RbDomainEntityInput,
      sortable: true,
    };

    return column;
  });

  const preparedAttributes = attributes.map((attribute: ResultAttribute) => {
    const column: Column<RbDomainEntityInput> = {
      title: [attribute.shortName, attribute.units || null].join(', '),
      accessor: attribute.code as keyof RbDomainEntityInput,
      sortable: true,
    };

    return column;
  });

  return [...preparedEntities, ...preparedAttributes];
};

export const prepareRows = ({ domainObjects }: ResultProjectStructure): Row<any>[] => {
  let rowNumber = 1;

  const preparedRows: any[] = [];

  domainObjects.forEach((domainObject) => {
    let addRowsNum = 0;

    // Row - structure of three small rows
    let row: any[] = [];

    domainObject.attributeValues.forEach((attrVal) => {
      attrVal.percentiles.forEach((percentile, percIndex) => {
        if (!row[percIndex]) {
          row[percIndex] = {};
        }

        row[percIndex].id = rowNumber + percIndex;
        row[percIndex][attrVal.code] = attrVal.values[percIndex];

        domainObject.parents.forEach((parent) => {
          row[percIndex][parent.code] = parent.name;
        });
      });

      addRowsNum = attrVal.percentiles.length;
    });

    preparedRows.push(...row);
    rowNumber += addRowsNum;
  });

  return [...preparedRows];
};
