import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EFluidType } from '@app/constants/Enums';
import {
  AttributeCode,
  DomainEntityCode,
} from '@app/constants/GeneralConstants';
import { RbDomainEntityInput } from '@app/generated/graphql';
import { TableActions } from '@app/store/table/tableActions';
import { tableInitialState } from '@app/store/table/tableReducers';
import { RootState, TreeFilter } from '@app/store/types';
import { GridActiveRow } from '@app/types/typesTable';
import { ContextMenu } from '@consta/uikit/ContextMenu';
import { IconProps } from '@consta/uikit/Icon';
import { IconAdd } from '@consta/uikit/IconAdd';
import { IconRemove } from '@consta/uikit/IconRemove';
import { Position } from '@consta/uikit/Popover';
import { Table } from '@consta/uikit/Table';

import { Column, Row } from './types';

import './TableResultRb.scss';

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

type Item = {
  name: string;
  icon: React.FC<IconProps>;
  code: menuItemCode;
};

type menuItemCode = 'remove' | 'add';

const menuItems: Item[] = [
  {
    code: 'remove',
    name: 'Уменьшить разрядность',
    icon: IconRemove,
  },
  {
    code: 'add',
    name: 'Увеличить разрядность',
    icon: IconAdd,
  },
];

function renderLeftSide(item: Item): React.ReactNode {
  const Icon = item.icon;
  return <Icon size="s" />;
}

export const TableResultRb: React.FC<Props> = ({ rows, columns, filter }) => {
  const dispatch = useDispatch();
  const rowRef = useRef(null);
  const [filteredRows, setFilteredRows] =
    useState<Row<RbDomainEntityInput>[]>(rows);
  const [filteredColumns, setFilteredColumns] =
    useState<Column<RbDomainEntityInput>[]>(columns);
  const [visible, setContextMenu] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );
  const fluidType: EFluidType | undefined = useSelector(
    ({ table }: RootState) => table.fluidType,
  );
  const decimalFixed: number = useSelector(({ table }: RootState) => {
    if (!table.decimalFixed && table.decimalFixed !== 0) {
      return tableInitialState.decimalFixed || 3;
    }
    return table.decimalFixed;
  });

  /**
   * Сортировка данных по клику на элемент древа
   * Нам необходимо убрать лишние колонки и отображать строки по переданным индексам
   */
  useEffect(() => {
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

        return row[AttributeCode.GeoType]?.value === fluidType;
      },
    );

    setFilteredRows(filteredRowsData);
    setFilteredColumns(filteredColumnsData);
  }, [filter, rows, columns, fluidType, setFilteredRows, setFilteredColumns]);

  /** Отлавливаем активный класс */
  useEffect(() => {
    setActiveClass(activeRow?.title || '');
  }, [activeRow]);

  /** Добавляем обработчик клика по шапке таблицы */
  useEffect(() => {
    document
      .querySelectorAll('.TableCell_isHeader')
      .forEach((element: Element) => {
        const rightSelector = element.querySelector(
          '.TableCell-Wrapper_horizontalAlign_right',
        );

        /** Показываем контекстное меню, в случае когда это числа, а числа у нас по правому краю */
        if (rightSelector === null) {
          return;
        }

        const htmlElement = element as HTMLElement;

        htmlElement.oncontextmenu = (event) => {
          event.preventDefault();

          const rect = element.getBoundingClientRect();

          setPosition({
            x: rect.left,
            y: rect.bottom,
          });

          setContextMenu(true);
        };
      });
  }, [setPosition, setContextMenu]);

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
    if (code && DataTransferItemList) {
      dispatch(TableActions.setActiveRow({ code, title: title || '' }));

      if (
        code.indexOf(DomainEntityCode.Layer) > -1 &&
        (title || '').indexOf('Всего') === -1
      ) {
        dispatch(TableActions.setSidebarRow({ code, title: title || '' }));
      }
    }
  };

  const handleClickOutside = () => setContextMenu(false);

  const handleContextMenuClick = (
    item: Item,
  ): React.EventHandler<React.MouseEvent<HTMLDivElement>> => {
    return (event: React.MouseEvent) => {
      dispatch(
        TableActions.setDecimalFixed(
          item.code === 'add' ? decimalFixed + 1 : decimalFixed - 1,
        ),
      );
    };
  };

  const isContextMenuDisabled = (item: Item) => {
    if (item.code === 'add' && decimalFixed > 7) {
      return true;
    }

    if (item.code === 'remove' && decimalFixed < 1) {
      return true;
    }

    return false;
  };

  return (
    <div className="table">
      <Table
        rows={filteredRows}
        columns={filteredColumns}
        verticalAlign="center"
        activeRow={{ id: undefined, onChange: handleClickRow }}
        size="s"
        className="TableResultRb"
        borderBetweenColumns
        borderBetweenRows
        isResizable
      />

      {visible && (
        <ContextMenu
          items={menuItems}
          getLabel={(item: Item) => item.name}
          ref={rowRef}
          getLeftSideBar={renderLeftSide}
          getOnClick={handleContextMenuClick}
          getDisabled={isContextMenuDisabled}
          direction="downStartLeft"
          position={position}
          size="s"
          onClickOutside={handleClickOutside}
        />
      )}
    </div>
  );
};
