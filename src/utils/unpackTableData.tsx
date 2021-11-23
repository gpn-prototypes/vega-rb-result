import React from 'react';
import { ColumnExpanderComponent } from '@app/components/Expander/ColumnExpanderComponent';
import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';

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
  DEFAULT_DECIMAL_FIXED,
  getDecimalByColumns,
  getDecimalRows,
} from '../store/table/tableReducers';
import { DecimalFixed, GridCollection } from '../types/typesTable';

import { LocalStorageHelper } from './LocalStorageHelper';
import { getNumberWithSpaces } from './StringHelper';

const isHasParentAll = (parents: Parent[]): boolean => {
  return (
    parents.find((innerParent: Parent) => innerParent.isTotal) !== undefined
  );
};

export type ViewType = 'attribute' | 'risk';

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

  const getPreparedColumn = ({
    title,
    accessor,
    align,
    mergeCells,
    visible,
    geoType,
    decimal,
    isRisk,
    control,
    columnAccessorGroup,
    renderCell,
  }: Column<RbDomainEntityInput>): Column<RbDomainEntityInput> => {
    return {
      title,
      accessor,
      align,
      mergeCells: mergeCells !== undefined ? mergeCells : true,
      isResizable: true,
      getComparisonValue: (row: Row<RbDomainEntityInput>) => row?.value || '',
      visible,
      geoType,
      decimal,
      isRisk,
      control,
      columnAccessorGroup,
      renderCell,
    };
  };

  const preparedEntities = domainEntities.map(
    (domainEntity: ResultDomainEntity, index: number) => {
      const column: Column<RbDomainEntityInput> = getPreparedColumn({
        title: domainEntity.name,
        accessor: domainEntity.code as keyof RbDomainEntityInput,
        visible: domainEntity?.visible,
        align: 'left',
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
              ? row[domainEntity.code]?.value
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
      });

      return column;
    },
  );

  /** Первая колонка аттрибутов */
  const firstMain = attributes.filter(
    (innerAttribute: ResultAttribute, index: number) =>
      innerAttribute.viewType === 'attribute',
  )[0];

  /** Первая колонка рисков */
  const firstRisk = attributes.filter(
    (innerAttribute: ResultAttribute, index: number) =>
      innerAttribute.viewType === 'risk',
  )[0];

  const isAttributeFirst = (attribute: ResultAttribute) =>
    firstMain && firstMain.code === attribute.code;

  const isRiskFirst = (attribute: ResultAttribute) =>
    firstRisk && firstRisk.code === attribute.code;

  const isAttributeOrRiskFirst = (attribute: ResultAttribute) =>
    isAttributeFirst(attribute) || isRiskFirst(attribute);

  /** Получение группы колонок, которые можно скрывать */
  const getColumnAccessorGroup = (attribute: ResultAttribute) => {
    if (isAttributeOrRiskFirst(attribute)) {
      return attributes
        .filter(
          (innerAttribute: ResultAttribute, index: number) =>
            innerAttribute.viewType ===
            (isAttributeFirst(attribute) ? 'attribute' : 'risk'),
        )
        .filter((_, index: number) => index !== 0)
        .map((innerAttribute: ResultAttribute) => innerAttribute.code as any);
    }

    return undefined;
  };

  /** Первая колонка аттрибутов */
  const getColumnControl = (attribute: ResultAttribute) => {
    if (isAttributeOrRiskFirst(attribute)) {
      return ({ column }) => <ColumnExpanderComponent column={column} />;
    }

    return undefined;
  };

  /** Берем значение из localstorage. Если его нет, то берем из бекенда */
  const getDecimalValue = (attribute: ResultAttribute): number => {
    const decimalFromLocalStorage: DecimalFixed | null =
      LocalStorageHelper.getParsed<DecimalFixed>(LocalStorageKey.DecimalFixed);
    if (
      decimalFromLocalStorage &&
      decimalFromLocalStorage[attribute.code] !== undefined
    ) {
      return decimalFromLocalStorage[attribute.code];
    }

    return attribute?.decimal !== undefined
      ? attribute?.decimal
      : DEFAULT_DECIMAL_FIXED;
  };

  const preparedAttributes = attributes.map(
    (attribute: ResultAttribute, index: number) => {
      const column: Column<RbDomainEntityInput> = getPreparedColumn({
        title: [attribute.shortName, attribute.units]
          .filter(Boolean)
          .join(', '),
        accessor: attribute.code as keyof RbDomainEntityInput,
        align: attribute.code === 'PERCENTILE' ? 'left' : 'right',
        visible: attribute?.visible,
        geoType: attribute?.geoType,
        mergeCells: false,
        control: getColumnControl(attribute),
        columnAccessorGroup: getColumnAccessorGroup(attribute),
        decimal: getDecimalValue(attribute),
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
            isNaN(value) || value === undefined
              ? value
              : getNumberWithSpaces(value);

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
      });

      return column;
    },
  );

  return [...preparedEntities, ...preparedAttributes];
};

/** Подготовка ячеек */
export const prepareRows = (
  { domainObjects, attributes }: ResultProjectStructure,
  columns: Column<RbDomainEntityInput>[],
): Row<RbDomainEntityInput>[] => {
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
            isNaN(value) || value === undefined
              ? value
              : getNumberWithSpaces(value.toString());

          /** Установка значения по коду */
          row[percIndex][attributeValue.code] = {
            code: attributeValue.code,
            value: attributeValue.values[percIndex],
            formattedValue,
          };

          /** Установка типа флюида в общий флоу */
          row[percIndex].geoFluidType = String(domainObject.geoFluidType);

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
              geoFluidType: domainObject?.geoFluidType,
            };
          });
        });

        addRowsNum = attributeValue.percentiles.length;
      },
    );

    preparedRows.push(...row);
    rowNumber += addRowsNum;
  });

  return [
    ...getDecimalRows(preparedRows, columns, getDecimalByColumns(columns)),
  ];
};

export function unpackTableData(
  projectStructure: ResultProjectStructure,
  version: number,
): GridCollection {
  const columns: Column<RbDomainEntityInput>[] =
    prepareColumns(projectStructure);
  const rows: Row<RbDomainEntityInput>[] = prepareRows(
    projectStructure,
    columns,
  );

  return {
    columns,
    rows,
    version,
  };
}
