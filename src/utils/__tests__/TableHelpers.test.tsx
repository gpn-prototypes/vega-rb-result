import { TableMock } from '@app/__tests__/Table.mock';
import { TreeItemData } from '@app/components/TreeEditor/types';
import { TreeItem } from '@gpn-prototypes/vega-ui';

import { TreeMock } from '../../__tests__/TreeMock';
import {
  getNodeListFromTableData,
  getRowId,
  getTreeNodeItem,
  mergeCustomizer,
  mergeObjectsInUnique,
  searchInTree,
} from '../TableHelpers';

describe('TableHelpers', () => {
  test('searchInTree', async () => {
    /** False */
    const searchedFalse1: TreeItem | null = searchInTree(
      TreeMock,
      'id99',
      'id',
    );
    const searchedFalse2: TreeItem | null = searchInTree(TreeMock, '', 'id');
    const searchedFalse3: TreeItem | null = searchInTree(
      TreeMock,
      'id1',
      'name',
    );

    expect(searchedFalse1).toEqual(null);
    expect(searchedFalse2).toEqual(null);
    expect(searchedFalse3).toEqual(null);

    /** True */
    const searchedTrue1: TreeItem | null = searchInTree(TreeMock, 'id1');
    const searchedTrue2: TreeItem | null = searchInTree(
      [TreeMock[1]],
      'id2',
      'id',
    );
    const searchedTrue3: TreeItem | null = searchInTree(
      TreeMock,
      'name1',
      'name',
    );

    expect(searchedTrue1!.id).toEqual('id1');
    expect(searchedTrue2!.id).toEqual('id2');
    expect(searchedTrue3!.name).toEqual('name1');
  });

  test('mergeObjectsInUnique', async () => {
    const merged: TreeItem<TreeItemData>[] = mergeObjectsInUnique<
      TreeItem<TreeItemData>
    >(TreeMock, ['parentId', 'name']);

    expect(merged.length).toEqual(3);
  });

  test('getRowId', async () => {
    const rowId = getRowId(TableMock.rows[0]);

    expect(rowId).toEqual(-1);
  });

  test('mergeCustomizer', async () => {
    const stringMerge = mergeCustomizer('1', '2', 's');
    const stringNumberMerge = mergeCustomizer('1', 1, 's');
    const numberNumberMerge = mergeCustomizer(1, 1, 's');
    const uuidMerge = mergeCustomizer(1, 1, 'id');
    const arrayStringAndStringMerge = mergeCustomizer([1, 2, 3], '', 's');
    const arrayStringAndNumberMerge = mergeCustomizer([1, 2, 3], 1, 's');
    const arrayNumberMerge = mergeCustomizer([1, 2, 3], [4, 5], 's');
    const arrayStringMerge = mergeCustomizer(['1'], ['2'], 's');

    expect(stringMerge).toEqual(undefined);
    expect(stringNumberMerge).toEqual(undefined);
    expect(numberNumberMerge).toEqual(undefined);
    expect(uuidMerge).not.toEqual(undefined);

    expect(arrayStringAndStringMerge).toEqual(undefined);
    expect(arrayStringAndNumberMerge).toEqual(undefined);

    expect(arrayNumberMerge?.length).toEqual(5);
    expect(arrayNumberMerge).toEqual([1, 2, 3, 4, 5]);

    expect(arrayStringMerge?.length).toEqual(2);
    expect(arrayStringMerge).toEqual(['1', '2']);
  });

  test('getTreeNodeItem', async () => {
    const defaultItem: TreeItem<TreeItemData> = getTreeNodeItem(
      TableMock.rows[0],
      0,
      0,
      'code',
    );

    const notRootItem: TreeItem<TreeItemData> = getTreeNodeItem(
      TableMock.rows[0],
      0,
      1,
      'code',
    );

    const withoutKey: TreeItem<TreeItemData> = getTreeNodeItem(
      TableMock.rows[0],
      0,
      1,
    );

    const withNodes: TreeItem<TreeItemData> = getTreeNodeItem(
      TableMock.rows[0],
      0,
      1,
      'code',
      [defaultItem, notRootItem, withoutKey],
    );

    /** Id нет у рутового item */
    expect(defaultItem.id).toEqual('');

    expect(notRootItem.id).not.toEqual('');

    expect(withoutKey.name).toEqual('? (заглушка)');
    expect(withNodes.parentId).not.toEqual(undefined);
  });

  test('getNodeListFromTableData', async () => {
    const empty: TreeItem<TreeItemData>[] = getNodeListFromTableData<
      TreeItem<TreeItemData>
    >(
      {
        columns: [],
        rows: [],
      },
      'test',
    );

    expect(empty.length).toEqual(1);

    const result1: TreeItem<TreeItemData>[] = getNodeListFromTableData<
      TreeItem<TreeItemData>
    >(
      {
        columns: TableMock.columns,
        rows: [],
      },
      'test',
    );

    expect(result1.length).toEqual(1);

    const result2: TreeItem<TreeItemData>[] = getNodeListFromTableData<
      TreeItem<TreeItemData>
    >(
      {
        columns: TableMock.columns,
        rows: TableMock.rows,
      },
      'test',
    );

    expect(result2.length).toEqual(1);
  });
});
