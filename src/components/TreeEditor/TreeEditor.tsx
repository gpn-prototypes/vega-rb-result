import React, { PropsWithChildren, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SvgResource from '@app/assets/icons/components/Resource';
import { cnTreeEditor } from '@app/components/TreeEditor/cn-tree-editor';
import treeFilterDuck from '@app/store/treeDuck';
import { RootState, TreeFilter } from '@app/store/types';
import { Text } from '@consta/uikit/Text';
import { Tree } from '@gpn-prototypes/vega-ui';

import {
  getNodeListFromTableData,
  searchInTree,
} from '../../utils/TableHelpers';
import {
  Column,
  RowEntity,
} from '../TableResultRbController/TableResultRb/types';

import { TargetData } from './types';

import './TreeEditor.css';

const icons = {
  'blue-line': <SvgResource color="#00eeaa" />,
  'orange-line': <SvgResource color="#00eeaa" />,
  'red-line': <SvgResource color="#00eeaa" />,
};

interface StructureTreeEditorProps {
  columns: Column[];
  rows: RowEntity[];
  isOpen: boolean;
}

export default React.forwardRef<HTMLDivElement, StructureTreeEditorProps>(
  function TreeEditor(
    { rows, columns, isOpen }: PropsWithChildren<StructureTreeEditorProps>,
    ref,
  ): React.ReactElement {
    const dispatch = useDispatch();
    const resetState = useCallback(
      () => dispatch(treeFilterDuck.actions.resetState()),
      [dispatch],
    );
    const setFilter = useCallback(
      ({ columnKeys, rowsIdx }: TreeFilter) =>
        dispatch(
          treeFilterDuck.actions.setFilter({
            columnKeys,
            rowsIdx,
          }),
        ),
      [dispatch],
    );

    const projectName = useSelector(({ project }: RootState) => project.name);

    const tree = useMemo(
      () => getNodeListFromTableData({ rows, columns }, projectName),
      [rows, columns, projectName],
    );

    const onSelect = (selectedItems: TargetData[]) => {
      if (selectedItems.length) {
        const node = searchInTree(tree, selectedItems[0].id);

        if (node && node.data) {
          const { columnIdx } = node.data.position[0];
          const rowsIds = node.data.position.map(({ rowIdx }) => rowIdx);

          setFilter({
            columnKeys:
              columns
                .filter(
                  (_, idx) => columnIdx >= idx && idx !== columns.length - 1,
                )
                .map(({ accessor }) => accessor || '') || '',
            rowsIdx: rowsIds,
          });
        } else {
          resetState();
        }
      } else {
        resetState();
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

          {/* WIP */}
          {/* <div className="tree-editor__header-icons">
            <SvgSearch onClick={() => alert('Search clicked')} />
            <SvgMoreVertical onClick={() => alert('More clicked')} />
          </div> */}
        </div>
        <div className={cnTreeEditor('Content').state({ open: isOpen })}>
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
