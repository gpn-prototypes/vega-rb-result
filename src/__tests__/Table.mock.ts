import { RbDomainEntityIcons } from '@app/generated/graphql';
import { GridCollection } from '@app/types/typesTable';

export const TableMock: GridCollection = {
  columns: [
    {
      title: 'Месторождение',
      accessor: 'code',
      align: 'left',
      visible: { calc: true, tree: true, table: true },
      sortable: true,
    },
    {
      title: 'Год открытия',
      accessor: 'name',
      align: 'center',
      visible: { calc: true, tree: false, table: true },
      sortable: true,
    },
    {
      title: 'Год открытия',
      accessor: 'icon',
      align: 'center',
      visible: { calc: true, tree: true, table: true },
      sortable: true,
    },
  ],
  rows: [
    {
      code: {
        id: 'code1',
        code: 'code1',
        value: 'code1',
        formattedValue: 'code1',
        visible: { calc: true, tree: true, table: true },
        icon: RbDomainEntityIcons.FieldIcon,
      },
      name: {
        id: 'name1',
        code: 'name1',
        value: 'name1',
        formattedValue: 'name1',
        visible: { calc: true, tree: false, table: true },
        isAll: true,
        icon: RbDomainEntityIcons.FieldIcon,
      },
      icon: {
        id: 'icon1',
        code: 'icon1',
        value: 'icon1',
        formattedValue: 'icon1',
        visible: { calc: true, tree: true, table: true },
        icon: RbDomainEntityIcons.FieldIcon,
      },
    },
  ],
  version: 1,
};
