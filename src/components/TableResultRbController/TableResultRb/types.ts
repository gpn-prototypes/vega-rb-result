class FieldValue {
}

export type Column = {
  title: React.ReactNode;
  accessor: string;
  align?: 'left';
  center;
  right;
  withoutPadding?: boolean;
  width?: number;
  sortable?: boolean;
  sortByField?: string;
  sortFn?: (a: FieldValue, b: FieldValue) => number;
  renderCell?: (row: Row) => React.ReactNode;
};

export type Row = {
  [key: string]: FieldValue;
  id: string;
};

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
