import { EFluidType } from './enums';

/** Время обновления информации о том, редактировался ли проект. */
export const IS_PROJECT_RECENTLY_EDITED_INTERVAL_IN_MS = 30000;

export const FLUID_TYPES = [
  EFluidType.OIL,
  EFluidType.GAS,
  EFluidType.OIL_N_GAS,
  EFluidType.ALL,
];
