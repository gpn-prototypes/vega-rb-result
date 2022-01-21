import { TreeItemData } from '@app/components/TreeEditor/types';
import { TreeItem } from '@gpn-prototypes/vega-ui';

export const TreeMock: TreeItem<TreeItemData>[] = [
  {
    name: 'name1',
    nodeList: [],
    id: 'id1',
  },
  {
    name: 'name2',
    nodeList: [],
    id: 'id2',
  },
  {
    name: 'name2',
    nodeList: [],
    id: 'id22',
  },
  {
    name: 'name3',
    nodeList: [
      {
        name: 'name31',
        nodeList: [],
        id: 'id31',
      },
      {
        name: 'name32',
        nodeList: [],
        id: 'id32',
      },
      {
        name: 'name33',
        nodeList: [],
        id: 'id33',
      },
    ],
    id: 'id3',
  },
];
