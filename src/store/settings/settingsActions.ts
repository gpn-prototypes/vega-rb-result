import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('settings');

export interface SettingStore {
  showHistogram: boolean;
  openSensitiveAnalysis: boolean;
}

export const SettingsActions = {
  resetState: factory<SettingStore>('RESET_STATE'),
  setShowHistogram: factory<boolean>('SET_SHOW_HISTOGRAM'),
  setOpenSensitiveAnalysis: factory<boolean>('SET_OPEN_SENSITIVE_ANALYSIS'),
};
