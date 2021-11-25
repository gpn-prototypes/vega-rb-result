import { RbDomainEntityIcons, Visible } from '@app/generated/graphql';
import { TableControl } from '@consta/uikit/Table';

export type RowEntity = Record<string, Row> & {
  geoFluidType?: string;
  isAll?: boolean;
  id?: string;
};

export type Row = {
  code: string;
  value: string;
  formattedValue: string;
  parentNames?: string;
  visible?: { calc: boolean; tree: boolean; table: boolean };
  icon?: RbDomainEntityIcons;
  id?: string;
  isAll?: boolean;
  isRisk?: boolean;
};
export interface Column<T = any> {
  sortable?: boolean;
  accessor: string;
  title: string;
  renderCell?: (row: RowEntity) => React.ReactNode;
  mergeCells?: boolean;
  isResizable?: boolean;
  align?: 'left' | 'right' | 'center';
  visible?: Visible;
  geoType?: string;
  isRisk?: boolean;
  decimal?: number;
  width?: number;
  hidden?: boolean;
  getComparisonValue?: (row: Row) => string;
  control?: ({ column }: TableControl<any>) => React.ReactNode;
  columnAccessorGroup?: string[];
}

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
