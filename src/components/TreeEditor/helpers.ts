import { RbDomainEntityInput } from '@app/generated/graphql';
import { getRowId } from '@app/utils/getRowId';
import { TreeItem } from '@gpn-prototypes/vega-ui';
import arrayToTree from 'array-to-tree';
import { get, groupBy, mergeWith } from 'lodash/fp';
import { v4 as uuid } from 'uuid';

import { Column, Row } from '../TableResultRbController/TableResultRb/types';

import { CellPosition, TreeItemData } from './types';

const getTreeNodeItem = (
  row: Record<string, Row<RbDomainEntityInput>>,
  rowIdx: number,
  columnIdx: number,
  columnKey?: string,
  nodes?: TreeItem<TreeItemData>[],
): TreeItem<TreeItemData> => {
  const isRoot = columnIdx === 0;

  const parentPos = isRoot
    ? undefined
    : ({
        rowIdx,
        columnIdx: columnIdx - 1,
      } as CellPosition);

  const parentId = isRoot
    ? undefined
    : nodes?.find((node) =>
        node.data?.position.some(
          (pos) =>
            pos.rowIdx === parentPos?.rowIdx &&
            pos.columnIdx === parentPos.columnIdx,
        ),
      )?.id;

  const name = row[columnKey || '']?.value || '? (заглушка)';

  return {
    name: name as string,
    data: {
      position: [
        {
          rowIdx,
          columnIdx,
        },
      ],
    },
    parentId,
    iconId: 'blue-line',
    nodeList: [],
    id: isRoot ? '' : uuid(),
  };
};

const mergeCustomizer = (
  objValue: string | number | Array<string | number>,
  srcValue: string | number | Array<string | number>,
  k: string,
) => {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue);
  }

  if (k === 'id') {
    return uuid();
  }

  return undefined;
};

export function searchInTree<T>(
  tree: TreeItem<T>[],
  value: string | number,
  key: keyof TreeItem = 'id',
  reverse = false,
): TreeItem<T> | null {
  const stack = [tree[0]];

  while (stack.length) {
    const node = stack[reverse ? 'pop' : 'shift']();
    if (node) {
      if (node[key] === value) return node;
      if (node.nodeList) {
        stack.push(...node.nodeList);
      }
    }
  }
  return null;
}

export function mergeObjectsInUnique<T>(array: T[], properties: string[]): T[] {
  const newArray = new Map();

  array.forEach((item: T) => {
    const propertyValue = properties.reduce((prev, curr) => {
      return `${prev}${get(curr, item)}`;
    }, '');

    if (newArray.has(propertyValue)) {
      newArray.set(
        propertyValue,
        mergeWith(mergeCustomizer, item, newArray.get(propertyValue)),
      );
    } else {
      newArray.set(propertyValue, item);
    }
  });
  return Array.from(newArray.values());
}

export function getNodeListFromTableData<T>(
  data: {
    columns: Column<RbDomainEntityInput>[];
    rows: Record<string, Row<RbDomainEntityInput>>[];
  },
  projectName: string,
): TreeItem<TreeItemData>[] {
  const { rows, columns } = data;

  const structurecolumnKeys = columns
    .filter(({ visible }) => visible?.tree)
    // .filter(
    //   ({ type, visible }) =>
    //     type === TableEntities.GEO_CATEGORY && visible?.tree,
    // )
    .map(({ accessor, title }) => ({
      key: accessor,
      name: title,
    }));

  const filledRows = rows.filter(
    (row: Record<string, Row<RbDomainEntityInput>>) => {
      if (row.isAll) {
        return false;
      }

      return structurecolumnKeys.some(
        ({ key, name }) => key !== 'id' && row[key]?.value,
      );
    },
  );

  const nodes: TreeItem<TreeItemData>[] = [];

  structurecolumnKeys.forEach(({ key: columnKey }, columnIdx) => {
    if (columnIdx === 0) {
      const map = groupBy(
        (item) => item.name,
        filledRows.map((row) =>
          getTreeNodeItem(row, getRowId(row), columnIdx, columnKey),
        ),
      );
      const items = Object.keys(map)
        .map((key) =>
          map[key].reduce(
            (prev, curr) => mergeWith(mergeCustomizer, prev, curr),
            {},
          ),
        )
        .flat(1) as TreeItem<TreeItemData>[];

      nodes.push(...items);
    } else {
      const items = filledRows.map((row) =>
        getTreeNodeItem(row, getRowId(row), columnIdx, columnKey, nodes),
      );

      if (structurecolumnKeys.length - 1 === columnIdx) {
        const groupByParent = groupBy(
          (item) => item.parentId,
          filledRows.map((row) =>
            getTreeNodeItem(row, getRowId(row), columnIdx, columnKey, nodes),
          ),
        );

        const groupByNameByParent = Object.keys(groupByParent).map(
          (key: string) => {
            return groupBy((item) => item.name, groupByParent[key]);
          },
        );

        const mappedData = groupByNameByParent
          .map((grouped) => {
            return Object.keys(grouped)
              .map((key) =>
                grouped[key].reduce(
                  (prev, curr) => mergeWith(mergeCustomizer, prev, curr),
                  {},
                ),
              )
              .flat(1) as TreeItem<TreeItemData>[];
          })
          .flat(1) as TreeItem<TreeItemData>[];

        nodes.push(...mappedData);
      } else {
        nodes.push(
          ...mergeObjectsInUnique<TreeItem<TreeItemData>>(items, [
            'parentId',
            'name',
          ]),
        );
      }
    }
  });

  const nodeList = arrayToTree(nodes, {
    parentProperty: 'parentId',
    customID: 'id',
    childrenProperty: 'nodeList',
  });

  return [
    {
      name: projectName,
      isDraggable: false,
      id: 'root',
      iconId: 'blue-line',
      nodeList,
    },
  ];
}
