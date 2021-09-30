import React, { PropsWithChildren, useMemo } from 'react';
import { Text, Tree } from '@gpn-prototypes/vega-ui';

import './TreeEditor.css';
import { cnTreeEditor } from "@app/components/TreeEditor/cn-tree-editor";
import { Column, Row } from '../TableResultRbController/TableResultRb/types';
import SvgSearch from '@app/assets/icons/components/Search';
import SvgMoreVertical from '@app/assets/icons/components/MoreVertical';
import SvgResource from '@app/assets/icons/components/Resource';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { getNodeListFromTableData, searchInTree } from './helpers';
import { getColumnsByType } from '@app/utils/getColumnsByType';
import { TableEntities } from '@app/types/enumsTable';
import { TargetData } from './types';
import treeFilterDuck from '@app/store/treeDuck';

const icons = {
  'blue-line': <SvgResource color="#00eeaa" />,
  'orange-line': <SvgResource color="#00eeaa" />,
  'red-line': <SvgResource color="#00eeaa" />,
};

interface StructureTreeEditorProps<T = any> {
  columns: Column<T>[];
  rows: Row<T>[];
  isOpen: boolean;
}

export default React.forwardRef<HTMLDivElement, StructureTreeEditorProps>(
  function TreeEditor(
    { rows, columns, isOpen }: PropsWithChildren<StructureTreeEditorProps>,
    ref,
  ): React.ReactElement {
    const dispatch = useDispatch();
    const projectName = useSelector(({ project }: RootState) => project.name);
    const tree = useMemo(
      () => getNodeListFromTableData({ rows, columns }, projectName),
      [rows, columns, projectName],
    );
    const domainEntitiesColumns = useMemo(
      () => getColumnsByType(columns, TableEntities.GEO_CATEGORY),
      [columns],
    );
    const onSelect = (selectedItems: TargetData[]) => {
      if (selectedItems.length) {
        const node = searchInTree(tree, selectedItems[0].id);
        if (node && node.data) {
          const { columnIdx } = node.data.position[0];
          const rowsIds = node.data.position.map(({ rowIdx }) => rowIdx);
          dispatch(
            treeFilterDuck.actions.setFilter({
              columnKeys: domainEntitiesColumns
                .filter(
                  (_, idx) =>
                    columnIdx >= idx &&
                    idx !== domainEntitiesColumns.length - 1,
                )
                .map(({ key }) => key || '') || '',
              rowsIdx: rowsIds,
            }),
          );
        } else {
          dispatch(treeFilterDuck.actions.resetState());
        }
      } else {
        dispatch(treeFilterDuck.actions.resetState());
      }
    };
    return (
      <div className={cnTreeEditor()} ref={ref}>
        <div className="tree-editor__header">
          <Text
            className={cnTreeEditor('Placeholder')
              .state({ open: isOpen })
              .toString()}
            size="xs"
            color="ghost"
          >
            Дерево проекта
          </Text>

          <div className="tree-editor__header-icons">
            <SvgSearch onClick={() => alert('Search clicked')} />
            <SvgMoreVertical onClick={() => alert('More clicked')} />
          </div>
        </div>
        <div className={cnTreeEditor('Content').state({ open: isOpen })}>
          {/* TODO: Необходимо обновить формат древа, под новую таблицу */}
          <Tree
            nodeList={tree}
            icons={icons}
            isDndEnable={false}
            isContextMenuEnable={false}
            onSelectItem={onSelect}
            withVisibilitySwitcher={false}
            withMultiSelect={false}
          />
        </div>
      </div>
    );
  },
);
