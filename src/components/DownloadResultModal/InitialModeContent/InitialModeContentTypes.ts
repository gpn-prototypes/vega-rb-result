export enum DownloadTypeEnum {
  Statistics = 'statistics',
  Samples = 'samples',
  Plots = 'plots',
}

export enum DownloadNameEnum {
  Statistics = 'Статистика',
  Samples = 'Сэмплы',
  Plots = 'Изображения',
}

export type DownloadData = {
  name: DownloadNameEnum;
  type: DownloadTypeEnum;
  size: string;
  disabled?: boolean;
};
