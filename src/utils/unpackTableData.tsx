import React from 'react';
import { ColumnExpanderComponent } from '@app/components/Expander/ColumnExpanderComponent';

import {
  Column,
  Row,
  RowEntity,
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
  getActualColumns,
  getDecimalRows,
  getHiddenColumns,
} from '../store/table/tableReducers';
import { DecimalFixed, GridCollection, ViewType } from '../types/typesTable';

import { getNumberWithSpaces } from './StringHelper';

const isHasParentAll = (parents: Parent[]): boolean => {
  return (
    parents.find((innerParent: Parent) => innerParent.isTotal) !== undefined
  );
};

export const getNameWithParents = (
  index: number,
  row: RowEntity,
  domainEntity: ResultDomainEntity,
  domainEntities: ResultDomainEntity[],
) => {
  return index === 0
    ? row[domainEntity.code]?.value
    : domainEntities
        .slice(0, index + 1)
        .map((entity: ResultDomainEntity) => row[entity.code]?.value || '')
        .join(',');
};

/** Подготовка колонок(маппинг данных с бэка) */
/** TODO: Вынести методы в хелперы и тестить их отдельно */
export const prepareColumns = ({
  domainEntities,
  attributes,
}: ResultProjectStructure): Column[] => {
  const getClass = (row: RowEntity): string => {
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
  }: Column): Column => {
    const column: Column = {
      title,
      accessor,
      align,
      isResizable: true,
      visible,
      geoType,
      decimal,
      isRisk,
      control,
      columnAccessorGroup,
      renderCell,
    };

    if (mergeCells === true) {
      column.getComparisonValue = (row: Row) => row?.parentNames || '';

      column.mergeCells = true;
    }

    return column;
  };

  const preparedEntities = domainEntities.map(
    (domainEntity: ResultDomainEntity, index: number) => {
      const column: Column = getPreparedColumn({
        title: domainEntity.name,
        accessor: domainEntity.code as keyof RbDomainEntityInput,
        visible: domainEntity?.visible,
        align: 'left',
        mergeCells: true,
        renderCell: (row: RowEntity) => {
          /** Заполняем коды и названия с учетом родителей, нужно для отправки данных в отображение гистограм */
          const codeWithParents =
            index === 0
              ? domainEntity.code
              : domainEntities
                  .slice(0, index + 1)
                  .map((entity: ResultDomainEntity) => entity.code)
                  .join(',');

          return (
            <div
              className={getClass(row)}
              data-code={codeWithParents}
              data-name={getNameWithParents(
                index,
                row,
                domainEntity,
                domainEntities,
              )}
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
    (innerAttribute: ResultAttribute) =>
      innerAttribute.viewType === ViewType.Attribute,
  )[0];

  /** Первая колонка рисков по нефти */
  const firstRiskOil = attributes.filter(
    (innerAttribute: ResultAttribute) =>
      innerAttribute.viewType === ViewType.RiskOil,
  )[0];

  /** Первая колонка рисков по газу */
  const firstRiskGas = attributes.filter(
    (innerAttribute: ResultAttribute) =>
      innerAttribute.viewType === ViewType.RiskGas,
  )[0];

  const isFirstByFluid = (fluid, attribute) =>
    fluid && fluid.code === attribute.code;

  const isAttributeOrRiskFirst = (attribute: ResultAttribute) =>
    isFirstByFluid(firstMain, attribute) ||
    isFirstByFluid(firstRiskOil, attribute) ||
    isFirstByFluid(firstRiskGas, attribute);

  const isAttributeOrRisk = (
    attribute: ResultAttribute,
  ): string | undefined => {
    if (isFirstByFluid(firstMain, attribute)) {
      return ViewType.Attribute;
    }
    if (isFirstByFluid(firstRiskOil, attribute)) {
      return ViewType.RiskOil;
    }
    if (isFirstByFluid(firstRiskGas, attribute)) {
      return ViewType.RiskGas;
    }

    return undefined;
  };

  /** Получение группы колонок, которые можно скрывать */
  const getColumnAccessorGroup = (attribute: ResultAttribute) => {
    if (isAttributeOrRiskFirst(attribute)) {
      return (
        attributes
          .filter(
            (innerAttribute: ResultAttribute) =>
              innerAttribute.viewType === isAttributeOrRisk(attribute),
          )
          .filter((_, index: number) => index !== 0)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((innerAttribute: ResultAttribute) => innerAttribute.code as any)
      );
    }

    return undefined;
  };

  /** Первая колонка аттрибутов */
  const getColumnControl = (attribute: ResultAttribute) => {
    if (isAttributeOrRiskFirst(attribute)) {
      return function ({ column }) {
        return <ColumnExpanderComponent column={column} />;
      };
    }

    return undefined;
  };

  const setCellTextAlign = ({ code }: ResultAttribute) => {
    return code === 'PERCENTILE' || code === 'GCOS_GAS' || code === 'GCOS_OIL'
      ? 'left'
      : 'right';
  };

  const preparedAttributes = attributes.map((attribute: ResultAttribute) => {
    const column: Column = getPreparedColumn({
      title: [attribute.shortName, attribute.units].filter(Boolean).join(', '),
      accessor: attribute.code as keyof RbDomainEntityInput,
      align: setCellTextAlign(attribute),
      visible: attribute?.visible,
      geoType: attribute?.geoType,
      control: getColumnControl(attribute),
      columnAccessorGroup: getColumnAccessorGroup(attribute),
      decimal: attribute?.decimal || 3,
      renderCell: (row: RowEntity) => {
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
          isNaN(Number(value)) || value === undefined
            ? value
            : getNumberWithSpaces(value);

        return (
          <div
            className={getClass(row)}
            id={attribute.code}
            data-code={codeWithParents}
            data-name={nameWithParents}
          >
            {/* TODO: Сделать хелпер */}
            {Number(formattedValue) === 0 ? '—' : formattedValue || '—'}
          </div>
        );
      },
    });

    return column;
  });

  return [...preparedEntities, ...preparedAttributes];
};

/** Подготовка ячеек */
export const prepareRows = ({
  domainObjects,
}: ResultProjectStructure): RowEntity[] => {
  let rowNumber = 1;

  const preparedRows: RowEntity[] = [];

  domainObjects.forEach((domainObject) => {
    let addRowsNum = 0;

    // Row - structure of three small rows
    const row: RowEntity[] = [];
    let isAllEmitted = false;

    domainObject.attributeValues.forEach(
      (attributeValue: ResultAttributeValue) => {
        attributeValue.percentiles.forEach((percentile, percIndex) => {
          /** Проверяем, есть ли элемент, и если нет - создаем */
          if (!row[percIndex]) {
            row[percIndex] = {} as RowEntity;
          }

          /** Устанавливаем необходимые данные для ячеек */
          row[percIndex].id = (rowNumber + percIndex).toString();

          const value = attributeValue.values[percIndex];
          const formattedValue =
            // eslint-disable-next-line no-restricted-globals
            isNaN(value as number) || value === undefined
              ? value
              : getNumberWithSpaces(value.toString());

          /** Установка значения по коду */
          row[percIndex][attributeValue.code] = {
            code: attributeValue.code,
            value: attributeValue.values[percIndex].toString(),
            formattedValue: formattedValue.toString(),
          };

          /** Установка типа флюида в общий флоу */
          row[percIndex].geoFluidTypes = domainObject.geoFluidTypes;

          /** Устанавливаем кастомные флаги, для того чтобы менять отображение таблицы */
          if (isHasParentAll(domainObject.parents)) {
            if (isAllEmitted) {
              row[percIndex].isAll = true;
            }

            isAllEmitted = true;
          }

          /** Пробегаемся по родителям и устанавливаем как значение ячейки, в таблице они объединятся */
          domainObject.parents.forEach((parent, indexParent: number) => {
            const parentCodes =
              indexParent === 0
                ? parent.code
                : domainObject.parents
                    .slice(0, indexParent + 1)
                    .map((innerParent) => innerParent.code || '')
                    .join(',');
            const parentNames =
              indexParent === 0
                ? parent.name
                : domainObject.parents
                    .slice(0, indexParent + 1)
                    .map((innerParent) => innerParent.name || '')
                    .join(',');

            row[percIndex][parent.code] = {
              code: attributeValue.code,
              value: parent.name,
              formattedValue: parent.name.toString(),
              parentNames,
              parentCodes,
            };
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
  decimalFixed: DecimalFixed,
): GridCollection {
  const columns: Column[] = prepareColumns(projectStructure);

  const rows: RowEntity[] = getDecimalRows(
    prepareRows(projectStructure),
    columns,
    decimalFixed,
  );
  const initialHiddenColumns = getHiddenColumns();

  return {
    columns,
    rows,
    version,
    actualColumns: getActualColumns(columns, initialHiddenColumns),
    decimalFixed,
    notFound: false,
  };
}
