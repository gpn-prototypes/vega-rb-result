export interface MenuContextItemChoice {
  values: number[];
  value: number;
}

export interface MenuContextItem {
  name: string;
  code?: string;
  switch?: boolean;
  border?: boolean;
  choice?: MenuContextItemChoice;
  icon?: () => React.ReactNode;
}

export interface MenuContextItemAnalysis {
  name?: string;
  code?: string;
  switch?: boolean;
  border?: boolean;
  choice?: MenuContextItemChoice;
  icon?: () => React.ReactNode;
  title?: string;
  id: number;
}

export interface MenuContextItemSwitchAnalysis {
  name: string;
  code: string;
  switch: boolean;
  id: number;
}
