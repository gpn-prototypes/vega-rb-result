import { RbDomainEntityIcons, Visible } from '@app/generated/graphql';
import { OrderType } from '@consta/uikit/__internal__/src/components/Table/helpers';
import { onCellClick, TableControl } from '@consta/uikit/Table';

export type RowEntity = Record<string, Row> & {
  geoFluidTypes?: string[];
  isAll?: boolean;
  id?: string;
};

export type Row = {
  code: string;
  value: string;
  formattedValue: string;
  parentNames?: string;
  parentCodes?: string;
  visible?: { calc: boolean; tree: boolean; table: boolean };
  icon?: RbDomainEntityIcons;
  id?: string;
  isAll?: boolean;
  isRisk?: boolean;
};
export interface Column {
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
  width?: number;
  hidden?: boolean;
  order?: OrderType;
  onCellClick?: onCellClick;
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
