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
}
