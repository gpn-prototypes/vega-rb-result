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
import {
  getDecimalRows,
  tableInitialState,
} from '../store/table/tableReducers';
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

    return baseClass;
  };

  /** TODO: Сделать один общий объект, и наполнять его в зависимости от логики, убрать дублирование */
  const preparedEntities = domainEntities.map(
    (domainEntity: ResultDomainEntity, index: number) => {
      const column: Column<RbDomainEntityInput> = {
        title: domainEntity.name,
        accessor: domainEntity.code as keyof RbDomainEntityInput,
        mergeCells: true,
        getComparisonValue: (row: Row<RbDomainEntityInput>) => row?.value || '',
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
              ? row[domainEntity.code].value
              : domainEntities
                  .slice(0, index + 1)
                  .map(
                    (entity: ResultDomainEntity) =>
                      row[entity.code]?.value || '',
                  )
                  .join(',');

          return (
            <div
              className={getClass(row, domainEntity)}
              data-code={codeWithParents}
              data-name={nameWithParents}
            >
              {row[domainEntity.code]?.value || ''}
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
      getComparisonValue: (row: Row<RbDomainEntityInput>) => row?.value || '',
      isResizable: true,
      renderCell: (row: Row<RbDomainEntityInput>) => {
        /** Заполняем коды и названия с учетом родителей, нужно для отправки данных в отображение гистограм */
        const codeWithParents = domainEntities
          .map((entity: ResultDomainEntity) => entity.code)
          .join(',');
        const nameWithParents = domainEntities
          .map((entity: ResultDomainEntity) => row[entity.code]?.value || '')
          .join(',');

        const value = row[attribute.code]?.formattedValue;

        const formattedValue =
          // eslint-disable-next-line no-restricted-globals
          !isNaN(value) || value === undefined
            ? value
            : new Intl.NumberFormat('ru-RU').format(value);

        return (
          <div
            className={getClass(row, attribute)}
            id={attribute.code}
            data-code={codeWithParents}
            data-name={nameWithParents}
          >
            {formattedValue || ''}
          </div>
        );
      },
    };

    return column;
  });

  return [...preparedEntities, ...preparedAttributes];
};

/** Подготовка ячеек */
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
    let isAllEmitted = false;

    domainObject.attributeValues.forEach(
      (attributeValue: ResultAttributeValue, attributeIndex: number) => {
        attributeValue.percentiles.forEach((percentile, percIndex) => {
          /** Проверяем, есть ли элемент, и если нет - создаем */
          if (!row[percIndex]) {
            row[percIndex] = {} as Row<RbDomainEntityInput>;
          }

          /** Устанавливаем необходимые данные для ячеек */
          row[percIndex].id = (rowNumber + percIndex).toString();

          const value = attributeValue.values[percIndex];
          const formattedValue =
            // eslint-disable-next-line no-restricted-globals
            !isNaN(value) || value === undefined
              ? value
              : new Intl.NumberFormat('ru-RU').format(value);

          /** Установка значения по коду */
          row[percIndex][attributeValue.code] = {
            code: attributeValue.code,
            value: attributeValue.values[percIndex],
            formattedValue,
          };

          /** Устанавливаем кастомные флаги, для того чтобы менять отображение таблицы */
          if (isHasParentAll(domainObject.parents)) {
            if (isAllEmitted) {
              row[percIndex].isAll = true;
            }

            isAllEmitted = true;
          }

          /** Пробегаемся по родителям и устанавливаем как значение ячейки, в таблице они объединятся */
          domainObject.parents.forEach((parent) => {
            row[percIndex][parent.code] = {
              code: attributeValue.code,
              value: parent.name,
              formattedValue: parent.name.toString(),
            };
          });
        });

        addRowsNum = attributeValue.percentiles.length;
      },
    );

    preparedRows.push(...row);
    rowNumber += addRowsNum;
  });

  return [...getDecimalRows(preparedRows, tableInitialState.decimalFixed)];
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
