import { RbDomainEntityIcons } from '@app/generated/graphql';
import { GridCollection } from '@app/types/typesTable';

export namespace TableMock {
  export const ColumnExpanderMock: GridCollection = {
    columns: [
      {
        title: 'Месторождение',
        accessor: 'code',
        align: 'left',
        sortable: true,
      },
      {
        title: 'Год открытия',
        accessor: 'name',
        align: 'center',
        sortable: true,
      },
      {
        title: 'Год открытия',
        accessor: 'icon',
        align: 'center',
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
          visible: { calc: true, tree: true, table: true },
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
}
