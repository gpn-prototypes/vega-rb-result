export enum DownloadTypeEnum {
  Statistics = 'statistics',
  ProjectData = 'projectData',
  Samples = 'samples',
  Plots = 'plots',
}

export enum DownloadNameEnum {
  Statistics = 'Статистика',
  ProjectData = 'Данные проекта',
  Samples = 'Сэмплы',
  Plots = 'Изображения',
}

export type DownloadData = {
  name: DownloadNameEnum;
  type: DownloadTypeEnum;
  size: string;
  disabled?: boolean;
};
