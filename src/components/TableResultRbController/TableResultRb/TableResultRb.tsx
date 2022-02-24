import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CustomContextMenu } from '@app/components/Helpers/ContextMenuHelper';
import { EFluidType, EFluidTypeCode, EGeoCategory } from '@app/constants/Enums';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import {
  TableActions,
  TableSetDecimalFixedActionPayload,
} from '@app/store/table/tableActions';
import { RootState, TreeFilter } from '@app/store/types';
import {
  DecimalFixed,
  GridActiveRow,
  HiddenColumns,
} from '@app/types/typesTable';
import { IconAdd } from '@consta/uikit/IconAdd';
import { IconRemove } from '@consta/uikit/IconRemove';
import { Position } from '@consta/uikit/Popover';
import { Table } from '@consta/uikit/Table';
import cn from 'classnames';

import { Column, RowEntity } from './types';

import './TableResultRb.css';

interface Props {
  rows: RowEntity[];
  columns: Column[];
  actualColumns: Column[];
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

/** Проверка, есть ли в отфильтрованных строках данные с учетом фильтрации колонок */
const isHasAnyValuesInFilteredRows = (
  columns: Column[],
  rows: RowEntity[],
): boolean => {
  return (
    /**
     * Пробегаемся по всем колонкам и в каждой колонке, исключая колонки без geoType
     * В каждой строке ищем наличие свойства по названию колонки
     * Если хоть одна такая есть - считаем, что данные есть
     */
    columns
      .filter(
        (column: Column) =>
          !column.hidden &&
          column.geoType !== '' &&
          column.geoType !== undefined,
      )
      .find((column: Column) => {
        let isHasAnyValue = false;

        rows.forEach((row: RowEntity) => {
          if (row[column.accessor] !== undefined) {
            isHasAnyValue = true;
          }
        });

        return isHasAnyValue;
      }) !== undefined
  );
};

export const TableResultRb: React.FC<Props> = ({
  rows,
  columns,
  actualColumns,
  filter,
}) => {
  const dispatch = useDispatch();
  const setActiveRow = useCallback(
    ({ code, title }: GridActiveRow) =>
      dispatch(TableActions.setActiveRow({ code, title })),
    [dispatch],
  );
  const setSidebarRow = useCallback(
    ({ code, title }: GridActiveRow) =>
      dispatch(TableActions.setSidebarRow({ code, title: title || '' })),
    [dispatch],
  );
  const setDecimalFixed = useCallback(
    ({ type, columnCode }: TableSetDecimalFixedActionPayload) =>
      dispatch(
        TableActions.setDecimalFixed({
          type,
          columnCode,
        }),
      ),
    [dispatch],
  );

  const rowRef = useRef(null);
  const [filteredRows, setFilteredRows] = useState<RowEntity[]>(rows);
  const [filteredColumns, setFilteredColumns] = useState<Column[]>(columns);
  const [visible, setContextMenu] = useState<boolean>(false);
  const [currentColumnCode, setCurrentColumnCode] = useState<string>('');
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );
  const entitiesCount: number = useSelector(
    ({ table }: RootState) => table.entitiesCount || 0,
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
  const hiddenColumns: HiddenColumns | undefined = useSelector(
    ({ table }: RootState) => table.hiddenColumns,
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
        (column: Column) => !filter.columnKeys.includes(column.accessor),
      );

      filteredRowsData = filteredRowsData.filter(
        (row: RowEntity, index: number) => {
          return filter.rowsIdx.includes(index);
        },
      );
    }

    /** Фильтрация колонок по типу флюида */
    filteredColumnsData = filteredColumnsData.map((column: Column) => {
      if (
        fluidType === EFluidType.ALL ||
        fluidType === EFluidType.OIL_N_GAS ||
        fluidType === undefined ||
        !column?.geoType ||
        (column?.geoType === EFluidTypeCode[EFluidType.OIL_N_GAS] &&
          column.accessor !== 'GAS_VOLUME_TO_ENTIRE_RESERVOIR')
      ) {
        return column;
      }

      const cloneColumn = { ...column };

      if (EFluidTypeCode[fluidType] !== column?.geoType) {
        cloneColumn.hidden = true;
      }

      return cloneColumn;
    });

    /** Фильтрация строк по типу флюида */
    filteredRowsData = filteredRowsData.filter((row: RowEntity) => {
      if (
        fluidType === EFluidType.ALL ||
        fluidType === undefined ||
        !row?.geoFluidTypes ||
        row.geoFluidTypes.length === 0
      ) {
        return true;
      }

      return row?.geoFluidTypes.includes(EFluidTypeCode[fluidType]);
    });

    if (
      filteredColumnsData.find((column: Column) => Boolean(column.geoType)) ===
        undefined ||
      isHasAnyValuesInFilteredRows(filteredColumnsData, filteredRowsData) ===
        false
    ) {
      filteredRowsData = [];
    }

    setFilteredRows(filteredRowsData);
    setFilteredColumns(filteredColumnsData);

    const { accessor } = filteredColumnsData[0];

    if (
      filteredColumnsData.length > 0 &&
      filteredRowsData.length > 0 &&
      filteredRowsData[0][accessor]
    ) {
      const code = filteredRowsData[0][accessor]?.parentCodes || '';
      const title = filteredRowsData[0][accessor]?.parentNames || '';

      setActiveRow({ code, title });
    }
  }, [
    filter,
    rows,
    columns,
    actualColumns,
    fluidType,
    setActiveRow,
    setFilteredRows,
    setFilteredColumns,
  ]);

  /** Отлавливаем активный класс */
  useEffect(() => {
    setActiveClass(activeRow?.title || '');
  }, [activeRow]);

  const onContextMenuClick = useCallback(
    (event, element: Element) => {
      event.preventDefault();

      const rightSelector = element.querySelector(
        '.TableCell-Wrapper_horizontalAlign_right',
      );
      const text = rightSelector?.textContent || '';

      if (!text) {
        return;
      }

      const rect = element.getBoundingClientRect();

      setCurrentColumnCode(
        columns.find((column: Column) => column.title === text)?.accessor || '',
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
    /**
     * Хак, в виду того, что в консте еще нет обработчика по кликам
     * TODO: https://github.com/gazprom-neft/consta-uikit/issues/1806
     *
     * Данный timeout нужен потому что при сокрытии колонок может не успеть обновиться DOM дерево
     * Поэтому нужен timeout
     */
    setTimeout(() => {
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
            onContextMenuClick(event, element);
        });
    });
  }, [onContextMenuClick, hiddenColumns]);

  const handleClickRow = ({
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
        setActiveRow({ code, title: title || '' });
      }

      if (
        code.split(',').length === entitiesCount &&
        (title || '').indexOf('Всего') === -1 &&
        openSensitiveAnalysis
      ) {
        setSidebarRow({ code, title: title || '' });
      }
    }
  };

  const handleContextMenuClick = (item: MenuContextItem): void => {
    setDecimalFixed({
      type: item.code === 'add' ? 'plus' : 'minus',
      columnCode: currentColumnCode || '',
    });
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

  const getAdditionalClassName = ({ column, row, isActive }): string => {
    return cn('TableCell', {
      '_light-background':
        row.GEO_CATEGORY?.value === EGeoCategory.RESOURCES &&
        !column.mergeCells &&
        !isActive,
    });
  };

  return (
    <div className="table">
      <Table
        rows={filteredRows as any}
        columns={filteredColumns}
        verticalAlign="center"
        activeRow={{ id: undefined, onChange: handleClickRow }}
        size="s"
        className="TableResultRb"
        borderBetweenColumns
        borderBetweenRows
        stickyHeader
        isResizable
        getAdditionalClassName={getAdditionalClassName}
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
