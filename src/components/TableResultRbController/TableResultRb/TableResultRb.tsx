import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CustomContextMenu } from '@app/components/Helpers/ContextMenuHelper';
import { EFluidType, EFluidTypeCode } from '@app/constants/Enums';
import { DomainEntityCode } from '@app/constants/GeneralConstants';
import { RbDomainEntityInput } from '@app/generated/graphql';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { TableActions } from '@app/store/table/tableActions';
import { RootState, TreeFilter } from '@app/store/types';
import { DecimalFixed, GridActiveRow } from '@app/types/typesTable';
import { IconAdd } from '@consta/uikit/IconAdd';
import { IconRemove } from '@consta/uikit/IconRemove';
import { Position } from '@consta/uikit/Popover';
import { Table } from '@consta/uikit/Table';

import { Column, Row } from './types';

import './TableResultRb.scss';

interface Props {
  rows: Row<RbDomainEntityInput>[];
  columns: Column<RbDomainEntityInput>[];
  actualColumns: Column<RbDomainEntityInput>[];
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

const menuItems = (): MenuContextItem[] => [
  {
    code: 'remove',
    name: 'Уменьшить разрядность',
    icon: () => <IconRemove size="s" />,
  },
  {
    code: 'add',
    name: 'Увеличить разрядность',
    icon: () => <IconAdd size="s" />,
  },
];

export const TableResultRb: React.FC<Props> = ({
  rows,
  columns,
  actualColumns,
  filter,
}) => {
  const dispatch = useDispatch();
  const rowRef = useRef(null);
  const [filteredRows, setFilteredRows] =
    useState<Row<RbDomainEntityInput>[]>(rows);
  const [filteredColumns, setFilteredColumns] =
    useState<Column<RbDomainEntityInput>[]>(columns);
  const [visible, setContextMenu] = useState<boolean>(false);
  const [currentColumnCode, setCurrentColumnCode] = useState<string>('');
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );
  const fluidType: EFluidType | undefined = useSelector(
    ({ table }: RootState) => table.fluidType,
  );
  const decimalFixed: DecimalFixed | undefined = useSelector(
    ({ table }: RootState) => table.decimalFixed,
  );
  const openSensitiveAnalysis: boolean = useSelector(
    ({ settings }: RootState) => settings.openSensitiveAnalysis,
  );
  const showHistogram: boolean = useSelector(
    ({ settings }: RootState) => settings.showHistogram,
  );

  /**
   * Сортировка данных по клику на элемент древа
   * Нам необходимо убрать лишние колонки и отображать строки по переданным индексам
   */
  useEffect(() => {
    let filteredRowsData = rows;
    let filteredColumnsData = actualColumns;

    if (filter?.columnKeys?.length > 0 && filter?.rowsIdx?.length > 0) {
      filteredColumnsData = filteredColumnsData.filter(
        (column: Column<RbDomainEntityInput>) =>
          !filter.columnKeys.includes(column.accessor),
      );

      filteredRowsData = filteredRowsData.filter(
        (row: Row<RbDomainEntityInput>, index: number) => {
          return filter.rowsIdx.includes(index);
        },
      );
    }

    /** Фильтрация данных по типу флюида */
    filteredColumnsData = filteredColumnsData.filter(
      (column: Column<RbDomainEntityInput>) => {
        if (
          fluidType === EFluidType.ALL ||
          fluidType === undefined ||
          !column?.geoType
        ) {
          return true;
        }

        return column?.geoType === EFluidTypeCode[fluidType];
      },
    );

    setFilteredRows(filteredRowsData);
    setFilteredColumns(filteredColumnsData);
  }, [
    filter,
    rows,
    columns,
    actualColumns,
    fluidType,
    setFilteredRows,
    setFilteredColumns,
  ]);

  /** Отлавливаем активный класс */
  useEffect(() => {
    setActiveClass(activeRow?.title || '');
  }, [activeRow]);

  const onContextMenuClick = useCallback(
    (event, element: Element, text: string) => {
      event.preventDefault();

      const rect = element.getBoundingClientRect();

      setCurrentColumnCode(
        columns.find(
          (column: Column<RbDomainEntityInput>) => column.title === text,
        )?.accessor || '',
      );

      setPosition({
        x: rect.left,
        y: rect.bottom,
      });

      setContextMenu(true);
    },
    [setPosition, setContextMenu, setCurrentColumnCode, columns],
  );

  /** Добавляем обработчик клика по шапке таблицы */
  useEffect(() => {
    document
      .querySelectorAll('.TableCell_isHeader')
      .forEach((element: Element) => {
        const rightSelector = element.querySelector(
          '.TableCell-Wrapper_horizontalAlign_right',
        );
        const text = rightSelector?.textContent || '';
        const blackListNames = ['Категория', 'Флюид'];

        /** Показываем контекстное меню, в случае когда это числа, а числа у нас по правому краю */
        if (rightSelector === null || blackListNames.includes(text)) {
          return;
        }

        const htmlElement = element as HTMLElement;

        htmlElement.oncontextmenu = (event) =>
          onContextMenuClick(event, element, text);
      });
  }, [onContextMenuClick]);

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
      if (showHistogram) {
        dispatch(TableActions.setActiveRow({ code, title: title || '' }));
      }

      if (
        code.indexOf(DomainEntityCode.Mine) > -1 &&
        (title || '').indexOf('Всего') === -1 &&
        openSensitiveAnalysis
      ) {
        dispatch(TableActions.setSidebarRow({ code, title: title || '' }));
      }
    }
  };

  const handleContextMenuClick = (item: MenuContextItem): void => {
    dispatch(
      TableActions.setDecimalFixed({
        type: item.code === 'add' ? 'plus' : 'minus',
        columnCode: currentColumnCode || '',
      }),
    );
  };

  const isContextMenuDisabled = (item: MenuContextItem) => {
    if (!decimalFixed) {
      return false;
    }

    if (item.code === 'add' && decimalFixed[currentColumnCode || ''] > 7) {
      return true;
    }

    if (item.code === 'remove' && decimalFixed[currentColumnCode || ''] < 1) {
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
        stickyHeader
        isResizable
      />

      {visible && (
        <CustomContextMenu
          menuItems={() => menuItems()}
          ref={rowRef}
          onClick={handleContextMenuClick}
          setIsOpenContextMenu={(isVisible) => setContextMenu(isVisible)}
          position={position}
          getDisabled={isContextMenuDisabled}
        />
      )}
    </div>
  );
};
