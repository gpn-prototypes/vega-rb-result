import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EFluidType } from '@app/common/enums';
import { AttributeCode } from '@app/constants/GeneralConstants';
import { RbDomainEntityInput } from '@app/generated/graphql';
import tableDuck from '@app/store/tableDuck';
import { RootState, TreeFilter } from '@app/store/types';
import { GridActiveRow } from '@app/types/typesTable';
import { Table } from '@consta/uikit/Table';

import { Column, Row } from './types';

import './TableResultRb.css';

interface Props {
  rows: Row<RbDomainEntityInput>[];
  columns: Column<RbDomainEntityInput>[];
  filter: TreeFilter;
}

const removeAllActiveClassByDataName = () => {
  document.querySelectorAll('._active').forEach((element: Element) => {
    if (element?.classList.contains('_active')) {
      element?.classList.remove('_active');
    }
  });
};

/**
 * Установка класса активности, при клике на ячейку или при наведении
 * Необходимо модифицировать DOM, потому что у нас нет контроля активности у ячеек через consta
 * Стандартный функционал выделения строк в consta не корректно работает при мерже ячеек
 */
const setActiveClass = (title: string) => {
  /** Чистим все классы активности */
  removeAllActiveClassByDataName();

  /**
   * Установка классов активности по включению dataset аттрибутов
   * Необходимо пройтись по всем родителям и по детям и установить необходимый класс
   * Для этого мы разбиваем(split) строку с названием и по каждой сущности проходим и устанавливаем класс
   */
  document
    .querySelectorAll(`[data-name*="${title}"]`)
    .forEach((element: Element) => {
      const parent = element.parentElement;

      parent?.classList.add('_active');
    });
};

export const TableResultRb: React.FC<Props> = ({ rows, columns, filter }) => {
  const dispatch = useDispatch();
  const [filteredRows, setFilteredRows] =
    useState<Row<RbDomainEntityInput>[]>(rows);
  const [filteredColumns, setFilteredColumns] =
    useState<Column<RbDomainEntityInput>[]>(columns);
  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );
  const fluidType: EFluidType | undefined = useSelector(
    ({ table }: RootState) => table.fluidType,
  );

  useEffect(() => {
    /**
     * Сортировка данных по клику на элемент древа
     * Нам необходимо убрать лишние колонки и отображать строки по переданным индексам
     */
    let filteredRowsData = rows;
    let filteredColumnsData = columns;

    if (filter?.columnKeys?.length > 0 && filter?.rowsIdx?.length > 0) {
      filteredColumnsData = columns.filter(
        (column: Column<RbDomainEntityInput>) =>
          !filter.columnKeys.includes(column.accessor),
      );

      filteredRowsData = rows.filter(
        (row: Row<RbDomainEntityInput>, index: number) => {
          return filter.rowsIdx.includes(index);
        },
      );
    }

    /** Фильтрация данных по типу флюида */
    filteredRowsData = filteredRowsData.filter(
      (row: Row<RbDomainEntityInput>) => {
        if (fluidType === EFluidType.ALL) {
          return true;
        }

        return row[AttributeCode.GeoType] === fluidType;
      },
    );

    setFilteredRows(filteredRowsData);
    setFilteredColumns(filteredColumnsData);
  }, [filter, rows, columns, fluidType, setFilteredRows, setFilteredColumns]);

  useEffect(() => {
    setActiveClass(activeRow?.title || '');
  }, [activeRow]);

  /** Хак:
   * В таблице мы добавили классы для ячеек, где их нужно объединить.
   * Тут мы их находим и добавляем к ячейке таблицы эти классы, чтоб убрать borders.
   * Хак нужен потому что мы не управляем напрямую таблицей. И нам нужно изнутри поменять класс у ячейки
   */
  useLayoutEffect(() => {
    document.querySelectorAll('._no-right').forEach((element: Element) => {
      const parentTd = element.parentElement?.parentElement;

      /** Необходимо не устанавливать ликвидацию бордера, если пред. элемент "Всего" */
      const isPreviousAll = () => {
        const previousTd = parentTd?.previousElementSibling;
        const previousAllElement = previousTd?.querySelector('._all');

        return previousAllElement !== null;
      };

      if (!isPreviousAll()) {
        parentTd?.classList.add('_no-right-border');
      }
    });
  });

  const handleClickRow = ({
    id,
    e,
  }: {
    id: string | undefined;
    e?: React.SyntheticEvent;
  }): void => {
    const element: HTMLElement = e?.target as HTMLElement;

    /** Клик может попасть как на внутренний элемент, так и на внешний */
    const innerElement: HTMLElement = (
      element.children[0] ? element.children[0] : element
    ) as HTMLElement;

    const code = innerElement?.dataset.code;
    const title = innerElement?.dataset.name;

    /** Отправляем активную строку в стору, это нужно для обновления данных в графиках */
    if (code && title) {
      dispatch(tableDuck.actions.setActiveRow({ code, title }));
    }
  };

  return (
    <div className="table">
      <Table
        rows={filteredRows}
        columns={filteredColumns}
        verticalAlign="center"
        activeRow={{ id: undefined, onChange: handleClickRow }}
        size="s"
        zebraStriped="odd"
        className="TableResultRb"
        borderBetweenColumns
        borderBetweenRows
        isResizable
      />
    </div>
  );
};
