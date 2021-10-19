import React from 'react';

import {
  Column,
  Row,
} from '../components/TableResultRbController/TableResultRb/types';
import {
  Parent,
  RbDomainEntityInput,
  ResultAttribute,
  ResultAttributeValue,
  ResultDomainEntity,
  ResultProjectStructure,
} from '../generated/graphql';
import { GridCollection } from '../types/typesTable';

const isHasParentAll = (parents: Parent[]): boolean => {
  return (
    parents.find((innerParent: Parent) => innerParent.isTotal) !== undefined
  );
};

/** Подготовка колонок */
export const prepareColumns = (
  data: ResultProjectStructure,
): Column<RbDomainEntityInput>[] => {
  const { domainEntities, attributes } = data;

  const getClass = (
    row: Row<RbDomainEntityInput>,
    domainEntity: ResultDomainEntity | ResultAttribute,
  ): string => {
    const baseClass = row.isAll ? '_all' : '';

    // if (row.isAll && row[domainEntity.code] === undefined) {
    //   baseClass += ' _no-right';
    // }

    return baseClass;
  };

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
          const codeWithParents =
            index === 0
              ? domainEntity.code
              : domainEntities
                  .slice(0, index + 1)
                  .map((entity: ResultDomainEntity) => entity.code)
                  .join(',');
          const nameWithParents =
            index === 0
              ? row[domainEntity.code]
              : domainEntities
                  .slice(0, index + 1)
                  .map((entity: ResultDomainEntity) => row[entity.code])
                  .join(',');

          return (
            <div
              className={getClass(row, domainEntity)}
              data-code={codeWithParents}
              data-name={nameWithParents}
            >
              {row[domainEntity.code] || ''}
            </div>
          );
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
        const codeWithParents = domainEntities
          .map((entity: ResultDomainEntity) => entity.code)
          .join(',');
        const nameWithParents = domainEntities
          .map((entity: ResultDomainEntity) => row[entity.code])
          .join(',');

        return (
          <div
            className={getClass(row, attribute)}
            id={attribute.code}
            data-code={codeWithParents}
            data-name={nameWithParents}
          >
            {row[attribute.code] || ''}
          </div>
        );
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
    const row: Row<RbDomainEntityInput>[] = [];
    let isAllEmited = false;

    domainObject.attributeValues.forEach(
      (attributeValue: ResultAttributeValue, attributeIndex: number) => {
        attributeValue.percentiles.forEach((percentile, percIndex) => {
          /** Проверяем, есть ли элемент, и если нет - создаем */
          if (!row[percIndex]) {
            row[percIndex] = {} as Row<RbDomainEntityInput>;
          }

          /** Устанавливаем необходимые данные для ячеек */
          row[percIndex].id = (rowNumber + percIndex).toString();

          /** Установка значения по коду */
          row[percIndex][attributeValue.code] =
            attributeValue.values[percIndex];

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
      },
    );

    preparedRows.push(...row);
    rowNumber += addRowsNum;
  });

  return [...preparedRows];
};

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
