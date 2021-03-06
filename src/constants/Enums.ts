export enum EFluidType {
  OIL = 'Нефть',
  GAS = 'Газ',
  OIL_N_GAS = 'Нефть И/ИЛИ Газ',
  ALL = 'Все',
}

export const EFluidTypeCode = {
  [EFluidType.OIL]: 'OIL',
  [EFluidType.GAS]: 'GAS',
  [EFluidType.OIL_N_GAS]: 'MIXTURE',
  [EFluidType.ALL]: '',
};

export enum EGeoCategory {
  RESOURCES = 'Ресурсы',
  RESERVES = 'Запасы',
}

export type SensitiveAnalysisAvailableTabs = 'Нефть' | 'Газ';
