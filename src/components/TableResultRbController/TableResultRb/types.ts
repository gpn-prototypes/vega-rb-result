import { RbDomainEntityInput, Visible } from '@app/generated/graphql';
import { TableControl, TableRow } from '@consta/uikit/Table';

export interface Column<T = any> {
  sortable?: boolean;
  accessor: keyof RbDomainEntityInput | 'id';
  title: string;
  renderCell?: (row: Row<T>) => React.ReactNode;
  mergeCells?: boolean;
  isResizable?: boolean;
  align?: 'left' | 'right';
  visible?: Visible;
  geoType?: string;
  isRisk?: boolean;
  decimal?: number;
  width?: number;
  getComparisonValue?: (row: Row[Column['accessor']]) => string;
  control?: ({ column }: TableControl<any>) => React.ReactNode;
  columnAccessorGroup?: (keyof RbDomainEntityInput | 'id')[];
}

export type Row<T = any> = TableRow &
  T & {
    code: string;
    value: string;
    formattedValue: string;
    isAll?: boolean;
    isRisk?: boolean;
  };

export type FilterComponentProps = {
  onConfirm: (value: any) => void;
  onCancel: () => void;
  filterValue?: any;
} & Record<string, unknown>;

export type Filter = {
  id: string;
  name: string;
  field: string;
  filterer: (value: any, filterValue?: any) => boolean;
} & (
  | { component?: never }
  | {
      component: {
        name: React.FC<FilterComponentProps>;
        props?: Omit<FilterComponentProps, 'onConfirm' | 'filterValue'>;
      };
    }
);

// type OnRowHover = ({ id, e }: { id: string | undefined; e: React.MouseEvent }) => void;
//
// type LazyLoad = { maxVisibleRows?: number; scrollableEl?: HTMLDivElement / Window; }
// maxVisibleRows - количество строк
// scrollableEl - элемент с onScroll listener
