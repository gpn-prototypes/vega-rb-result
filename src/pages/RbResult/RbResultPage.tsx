import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DownloadResultModal } from '@app/components/DownloadResultModal/DownloadResultModal';
import { HistogramComponent } from '@app/components/Histograms/HistogramComponent';
import NotifyComponent from '@app/components/Notify/Notify';
import { SensitiveAnalysisComponent } from '@app/components/SensitiveAnalysis/SensitiveAnalysisComponent';
import { TableErrorAlert } from '@app/components/TableErrorAlert';
import { TableResultRb } from '@app/components/TableResultRbController/TableResultRb/TableResultRb';
import TreeEditor from '@app/components/TreeEditor';
import { EFluidType } from '@app/constants/Enums';
import {
  FLUID_TYPES,
  IS_PROJECT_RECENTLY_EDITED_INTERVAL_IN_MS,
} from '@app/constants/GeneralConstants';
import projectService from '@app/services/ProjectService';
import competitiveAccessDuck from '@app/store/competitiveAccessDuck';
import { GeneralActions } from '@app/store/general/generalActions';
import { HistogramActions } from '@app/store/histogram/HistogramActions';
import { LoaderAction } from '@app/store/loader/loaderActions';
import { NotifyActions } from '@app/store/notify/notifyActions';
import projectDuck from '@app/store/projectDuck';
import { SettingsActions } from '@app/store/settings/settingsActions';
import { TableActions } from '@app/store/table/tableActions';
import treeDuck from '@app/store/treeDuck';
import { RootState } from '@app/store/types';
import { GridActiveRow } from '@app/types/typesTable';
import { Checkbox } from '@consta/uikit/Checkbox';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { IconCollapse } from '@consta/uikit/IconCollapse';
import { IconDownload } from '@consta/uikit/IconDownload';
import { IconExpand } from '@consta/uikit/IconExpand';
import { cnMixCard } from '@consta/uikit/MixCard';
import { Sidebar } from '@consta/uikit/Sidebar';
import { Text } from '@consta/uikit/Text';
import { SplitPanes, useInterval, useMount } from '@gpn-prototypes/vega-ui';
import { block } from 'bem-cn';

import './RbResultPage.css';

const cn = block('RbResultPage');

const RbResultPage: React.FC = () => {
  const dispatch = useDispatch();

  const histogramIsLoading: boolean = useSelector(
    ({ loader }: RootState) => loader.loading.histogram,
  );

  const tableIsLoading: boolean = useSelector(
    ({ loader }: RootState) => loader.loading.table,
  );

  const isTabsDisabled = useMemo(
    () => tableIsLoading || histogramIsLoading,
    [tableIsLoading, histogramIsLoading],
  );

  const setFluidType = useCallback(
    (type: EFluidType) => dispatch(TableActions.setFluidType(type)),
    [dispatch],
  );
  const updateProjectName = useCallback(
    (projectName: string) =>
      dispatch(projectDuck.actions.updateProjectName(projectName)),
    [dispatch],
  );
  const setRecentlyEdited = useCallback(
    (recentlyEdited: boolean) =>
      dispatch(competitiveAccessDuck.actions.setRecentlyEdited(recentlyEdited)),
    [dispatch],
  );

  const treeEditorRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isShownTree, setIsShownTree] = useState(true);
  const [openedModal, setOpenedModal] = useState<boolean>(false);

  const sidebarRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.sidebarRow,
  );
  const isNotFound: boolean = useSelector(
    ({ table }: RootState) => table.notFound,
  );

  const isRecentlyEdited = useSelector(
    ({ competitiveAccess }: RootState) => competitiveAccess.isRecentlyEdited,
  );
  const showHistogram = useSelector(
    ({ settings }: RootState) => settings.showHistogram,
  );
  const openSensitiveAnalysis = useSelector(
    ({ settings }: RootState) => settings.openSensitiveAnalysis,
  );
  const fluidType = useSelector(
    ({ table }: RootState) => table.fluidType || EFluidType.ALL,
  );

  const handleResize = (): void => {
    if (treeEditorRef?.current?.clientWidth) {
      setIsShownTree(Number(treeEditorRef?.current?.clientWidth) > 120);
    }
  };

  const handleChangeFluidType = (type: EFluidType) => {
    setFluidType(type);
  };

  /** Очищаем стору */
  useMount(() => {
    return () => {
      dispatch(NotifyActions.resetState());
      dispatch(GeneralActions.resetState());
      dispatch(SettingsActions.resetState());
      dispatch(treeDuck.actions.resetState());
      dispatch(TableActions.resetState());
      dispatch(HistogramActions.resetState());
      dispatch(LoaderAction.resetStore());
    };
  });

  useEffect(() => {
    projectService
      .getProjectName()
      .then((projectName) => updateProjectName(projectName));
  }, [updateProjectName]);

  useInterval(IS_PROJECT_RECENTLY_EDITED_INTERVAL_IN_MS, () => {
    projectService
      .getProjectRecentlyEdited()
      .then((recentlyEdited) => {
        if (recentlyEdited === isRecentlyEdited) {
          return;
        }
        setRecentlyEdited(recentlyEdited);
      })
      .catch(() => setRecentlyEdited(false));
  });

  if (isNotFound) {
    return (
      <Text
        className={cnMixCard({
          verticalSpace: 'm',
          horizontalSpace: 'm',
          form: 'square',
          shadow: false,
        })}
        view="alert"
      >
        Были обновлены входные данные. Сделайте повторный расчет.
      </Text>
    );
  }

  /** TODO: Разнести на мелкие компоненты */
  return (
    <div>
      <div>
        <SplitPanes split="vertical" onResize={handleResize}>
          <SplitPanes.Pane
            aria-label="tree"
            initialSize="180px"
            min="24px"
            max="240px"
          >
            <TreeEditor isOpen={isShownTree} ref={treeEditorRef} />
          </SplitPanes.Pane>
          <SplitPanes.Pane aria-label="table">
            <div className={cn('Content')}>
              <div>
                <div className={cn('TableContent')}>
                  <div className={cn('Header')}>
                    <div className={cn('TabsWrapper')}>
                      <ChoiceGroup
                        value={fluidType}
                        items={FLUID_TYPES}
                        name="FluidTypesChoiceGroup"
                        className="FluidTypesChoiceGroup"
                        size="s"
                        view="ghost"
                        width="full"
                        multiple={false}
                        getLabel={(item) => item}
                        onChange={({ value }) => handleChangeFluidType(value)}
                        disabled={isTabsDisabled}
                      />
                    </div>

                    <div className={cn('Settings')}>
                      <span className={cn('SettingElement')}>
                        <Checkbox
                          view="primary"
                          checked={openSensitiveAnalysis}
                          onChange={({ checked }) =>
                            dispatch(
                              SettingsActions.setOpenSensitiveAnalysis(checked),
                            )
                          }
                          label="Открывать анализ чувствительности"
                        />
                      </span>

                      <span ref={settingsRef} className={cn('SettingElement')}>
                        <IconDownload
                          onClick={() => setOpenedModal(true)}
                          size="m"
                        />
                      </span>

                      <span className={cn('SettingElement')}>
                        {showHistogram ? (
                          <IconExpand
                            onClick={() =>
                              dispatch(SettingsActions.setShowHistogram(false))
                            }
                          />
                        ) : (
                          <IconCollapse
                            onClick={() =>
                              dispatch(SettingsActions.setShowHistogram(true))
                            }
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className={cn('Table', { full: !showHistogram })}>
                    <TableResultRb />
                  </div>
                </div>

                <div className={cn('Graphs', { hide: !showHistogram })}>
                  <HistogramComponent />
                </div>

                {openSensitiveAnalysis && (
                  <Sidebar
                    isOpen={sidebarRow !== undefined}
                    onClickOutside={() =>
                      dispatch(TableActions.resetSidebarRow())
                    }
                    hasOverlay
                    className={cn('Sidebar')}
                  >
                    {sidebarRow && (
                      <SensitiveAnalysisComponent sidebarRow={sidebarRow} />
                    )}
                  </Sidebar>
                )}
              </div>
            </div>
          </SplitPanes.Pane>
        </SplitPanes>

        {openedModal && (
          <DownloadResultModal handleClose={() => setOpenedModal(false)} />
        )}

        <NotifyComponent />
        <TableErrorAlert />
      </div>
    </div>
  );
};

export default RbResultPage;
