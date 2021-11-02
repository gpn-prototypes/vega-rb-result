import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';
import { LocalStorageHelper } from '@app/utils/LocalStorageHelper';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { SettingsActions, SettingStore } from './settingsActions';

export const showHistogramFromLocalStorage = Boolean(
  LocalStorageHelper.getParsed<boolean>(LocalStorageKey.ShowHistogram),
);

export const openSensitiveAnalysisFromLocalStorage = Boolean(
  LocalStorageHelper.getParsed<boolean>(LocalStorageKey.OpenSensitiveAnalysis),
);

export const settingsInitialState: SettingStore = {
  showHistogram: showHistogramFromLocalStorage,
  openSensitiveAnalysis: openSensitiveAnalysisFromLocalStorage,
};

export const SettingsReducers = reducerWithInitialState<SettingStore>(
  settingsInitialState,
)
  .case(SettingsActions.resetState, () => settingsInitialState)
  .case(
    SettingsActions.setShowHistogram,
    (state: SettingStore, showHistogram: boolean) => {
      LocalStorageHelper.setParsed<boolean>(
        LocalStorageKey.ShowHistogram,
        showHistogram,
      );

      return {
        ...state,
        showHistogram,
      };
    },
  )
  .case(
    SettingsActions.setOpenSensitiveAnalysis,
    (state: SettingStore, openSensitiveAnalysis: boolean) => {
      LocalStorageHelper.setParsed<boolean>(
        LocalStorageKey.OpenSensitiveAnalysis,
        openSensitiveAnalysis,
      );

      return {
        ...state,
        openSensitiveAnalysis,
      };
    },
  );
