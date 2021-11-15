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
        id: 'row1',
        code: 'row1',
        name: 'row1',
        value: 'row1',
        formattedValue: 'row2',
        visible: { calc: true, tree: true, table: true },
        icon: RbDomainEntityIcons.FieldIcon,
      },
      {
        id: 'row2',
        code: 'row2',
        value: 'row2',
        formattedValue: 'row2',
        name: 'row2',
        visible: { calc: true, tree: true, table: true },
        icon: RbDomainEntityIcons.FieldIcon,
      },
    ],
    version: 1,
  };
}
