export interface MenuContextItemChoice {
  values: number[];
  value: number;
}

export interface MenuContextGroup {
  id: number;
  title: string;
  children: MenuContextItem[];
}

export interface MenuContextItem {
  name: string;
  code?: string;
  switch?: boolean;
  border?: boolean;
  choice?: MenuContextItemChoice;
  icon?: () => React.ReactNode;
}
