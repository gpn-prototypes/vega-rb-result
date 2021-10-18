import React from 'react';
import {
  ResultProjectStructure,
  RbDomainEntityInput,
  ResultDomainEntity,
  ResultAttribute,
  Parent,
  ResultAttributeValue,
} from '../generated/graphql';
import { GridCollection } from '../types/typesTable';
import {
  Column,
  Row,
} from '../components/TableResultRbController/TableResultRb/types';

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

// function constructColumns({
//   domainEntities = [],
//   attributes = [],
//   risks = [],
// }: ProjectStructureInput): Column<RbDomainEntityInput>[] {
//   /** TODO: Доработать логикой */
//   return domainEntities.map((domainEntity: RbDomainEntityInput) => {
//     const column: Column<RbDomainEntityInput> = {
//       title: domainEntity.name,
//       accessor: domainEntity.code as keyof RbDomainEntityInput,
//       sortable: true,
//     };

//     return column;
//   });
// }

export function unpackTableData(
  projectStructure: ResultProjectStructure,
  version: number,
): GridCollection {
  const columns: Column<RbDomainEntityInput>[] =
    prepareColumns(projectStructure);
  const rows: Row<RbDomainEntityInput>[] = prepareRows(projectStructure);

  return {
    columns,
    rows,
    version,
  };
}

/** Подготовка колонок */
export const prepareColumns = (
  data: ResultProjectStructure,
): Column<RbDomainEntityInput>[] => {
  const { domainEntities, attributes } = data;

  const getClass = (row: Row<RbDomainEntityInput>, domainEntity: ResultDomainEntity | ResultAttribute): string => {
    let baseClass = row.isAll ? '_all' : '';

    // if (row.isAll && row[domainEntity.code] === undefined) {
    //   baseClass += ' _no-right';
    // }

    return baseClass;
  }

  const preparedEntities = domainEntities.map(
    (domainEntity: ResultDomainEntity, index: number) => {
      const column: Column<RbDomainEntityInput> = {
        title: domainEntity.name,
        accessor: domainEntity.code as keyof RbDomainEntityInput,
        mergeCells: true,
        isResizable: true,
        visible: domainEntity?.visible,
        renderCell: (row: Row<RbDomainEntityInput>) => {
          /** Заполняем коды и названия с учетом родителей, нужно для отправки данных в отображение гистограм */
          const codeWithParents = index === 0
            ? domainEntity.code
            : domainEntities.slice(0, index + 1).map((entity: ResultDomainEntity) => entity.code).join(',');
          const nameWithParents = index === 0
            ? row[domainEntity.code]
            : domainEntities.slice(0, index + 1).map((entity: ResultDomainEntity) => row[entity.code]).join(',');

          return <div
            className={getClass(row, domainEntity)}
            data-code={codeWithParents}
            data-name={nameWithParents}
          >{row[domainEntity.code] || ''}</div>;
        },
      };

      return column;
    },
  );

  const preparedAttributes = attributes.map((attribute: ResultAttribute) => {
    const column: Column<RbDomainEntityInput> = {
      title: [attribute.shortName, attribute.units].filter(Boolean).join(', '),
      accessor: attribute.code as keyof RbDomainEntityInput,
      mergeCells: true,
      align: attribute.code === 'PERCENTILE' ? 'left' : 'right',
      isResizable: true,
      renderCell: (row: Row<RbDomainEntityInput>) => {
        /** Заполняем коды и названия с учетом родителей, нужно для отправки данных в отображение гистограм */
        const codeWithParents = domainEntities.map((entity: ResultDomainEntity) => entity.code).join(',');
        const nameWithParents = domainEntities.map((entity: ResultDomainEntity) => row[entity.code]).join(',');

        return <div
          className={getClass(row, attribute)} id={attribute.code}
          data-code={codeWithParents}
          data-name={nameWithParents}
        >{row[attribute.code] || ''}</div>;
      },
    };

    return column;
  });

  return [...preparedEntities, ...preparedAttributes];
};

/** Подгтовка ячеек */
export const prepareRows = ({
  domainObjects,
  attributes,
}: ResultProjectStructure): Row<RbDomainEntityInput>[] => {
  let rowNumber = 1;

  const preparedRows: Row<RbDomainEntityInput>[] = [];

  domainObjects.forEach((domainObject) => {
    let addRowsNum = 0;

    // Row - structure of three small rows
    let row: Row<RbDomainEntityInput>[] = [];
    let isAllEmited = false;

    domainObject.attributeValues.forEach((attributeValue: ResultAttributeValue, attributeIndex: number) => {
      attributeValue.percentiles.forEach((percentile, percIndex) => {
        /** Проверяем, есть ли элемент, и если нет - создаем */
        if (!row[percIndex]) {
          row[percIndex] = {} as Row<RbDomainEntityInput>;
        }

        /** Устанавливаем необходимые данные для ячеек */
        row[percIndex].id = (rowNumber + percIndex).toString();

        /** Установка значения по коду */
        row[percIndex][attributeValue.code] = attributeValue.values[percIndex];

        /** Устанавливаем кастомные флаги, для того чтобы менять отображение таблицы */
        if (isHasParentAll(domainObject.parents)) {
          if (isAllEmited) {
            row[percIndex].isAll = true;
          }

          isAllEmited = true;
        }

        /** Пробегаемся по родителям и устанавливаем как значение ячейки, в таблице они объединятся */
        domainObject.parents.forEach((parent) => {
          row[percIndex][parent.code] = parent.name;
        });
      });

      addRowsNum = attributeValue.percentiles.length;
    });

    preparedRows.push(...row);
    rowNumber += addRowsNum;
  });

  return [...preparedRows];
};

function isHasParentAll(parents: Parent[]): boolean {
  return parents.find((innerParent: Parent) => innerParent.isTotal) !== undefined;
}
