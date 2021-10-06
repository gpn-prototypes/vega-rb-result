import { TableEntities } from '@app/types/enumsTable';
import { VisibilityProperties } from '@app/types/typesTable';
import { TableRow, TableColumn } from '@consta/uikit/Table';

export type Column<T = any> = TableColumn<Row<T>> & {
  visible?: VisibilityProperties;
  type?: TableEntities;
  name?: string;
  key?: string;
  mergeCells?: boolean;
};

export type Row<T = any> = TableRow & T;

export type FilterComponentProps = {
  onConfirm: (value: any) => void;
  onCancel: () => void;
  filterValue?: any
} & Record<string, unknown>;

export type Filter = {
  id: string;
  name: string;
  field: string;
  filterer: (value: any, filterValue?: any) => boolean;
} & ({ component?: never } | {
  component: {
    name: React.FC<FilterComponentProps>;
    props?: Omit<FilterComponentProps, 'onConfirm' | 'filterValue'>;
  }
});

// type OnRowHover = ({ id, e }: { id: string | undefined; e: React.MouseEvent }) => void;
//
// type LazyLoad = { maxVisibleRows?: number; scrollableEl?: HTMLDivElement / Window; }
// maxVisibleRows - количество строк
// scrollableEl - элемент с onScroll listener
