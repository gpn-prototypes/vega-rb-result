import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HistogramComponent } from '@app/components/Histograms/HistogramComponent';
import NotifyComponent from '@app/components/Notify/Notify';
import { SensitiveAnalysisComponent } from '@app/components/SensitiveAnalysis/SensitiveAnalysisComponent';
import { TableErrorAlert } from '@app/components/TableErrorAlert';
import Table from '@app/components/TableResultRbController';
import TreeEditor from '@app/components/TreeEditor';
import { EFluidType } from '@app/constants/Enums';
import {
  FLUID_TYPES,
  IS_PROJECT_RECENTLY_EDITED_INTERVAL_IN_MS,
} from '@app/constants/GeneralConstants';
import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';
import projectService from '@app/services/ProjectService';
import { loadArchive } from '@app/services/utilsService';
import competitiveAccessDuck from '@app/store/competitiveAccessDuck';
import { GeneralActions } from '@app/store/general/generalActions';
import histogramDuck from '@app/store/histogramDuck';
import { NotifyActions } from '@app/store/notify/notifyActions';
import projectDuck from '@app/store/projectDuck';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';
import { SettingsActions } from '@app/store/settings/settingsActions';
import { TableActions } from '@app/store/table/tableActions';
import treeDuck from '@app/store/treeDuck';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { LocalStorageHelper } from '@app/utils/LocalStorageHelper';
import { Checkbox } from '@consta/uikit/Checkbox';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { IconCollapse } from '@consta/uikit/IconCollapse';
import { IconDownload } from '@consta/uikit/IconDownload';
import { IconExpand } from '@consta/uikit/IconExpand';
import { cnMixCard } from '@consta/uikit/MixCard';
import { Sidebar } from '@consta/uikit/Sidebar';
import { Item } from '@consta/uikit/SnackBar';
import { Text } from '@consta/uikit/Text';
import { SplitPanes, useInterval, useMount } from '@gpn-prototypes/vega-ui';

import './RbResultPage.css';

const RbResultPage: React.FC = () => {
  const dispatch = useDispatch();
  const resetState = useCallback(() => {
    dispatch(NotifyActions.resetState());
    dispatch(TableActions.resetState());
    dispatch(GeneralActions.resetState());
    dispatch(SettingsActions.resetState());
    dispatch(histogramDuck.actions.resetState());
    dispatch(sensitiveAnalysisDuck.actions.resetState());
    dispatch(treeDuck.actions.resetState());
  }, [dispatch]);
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
  const appendItem = useCallback(
    (item: Item) => dispatch(NotifyActions.appendItem(item)),
    [dispatch],
  );
  const removeItem = useCallback(
    (id: string) => dispatch(NotifyActions.removeItem(id)),
    [dispatch],
  );
  const treeEditorRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isShownTree, setIsShownTree] = useState(true);

  const data: GridCollection = useSelector(({ table }: RootState) => table);
  const sidebarRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.sidebarRow,
  );
  const isNotFound: boolean = useSelector(
    ({ general }: RootState) => general.notFound,
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

  useMount(() => {
    return resetState;
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

  const downloadResult = async (): Promise<void> => {
    try {
      appendItem({
        key: 'notify',
        message: 'Идет генерация файла',
        status: 'system',
      });

      /** Таймаут добавлен для того, что бы визуально не мелькала нотификация */
      setTimeout(async () => {
        await loadArchive(
          LocalStorageHelper.get(LocalStorageKey.ResultId) || '',
        );

        removeItem('notify');
      }, 1500);
    } catch (e) {
      console.warn(e);
    }
  };

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

  return (
    <div>
      {!data ? (
        <Text view="primary" size="2xl">
          Необходимо запустить расчет
        </Text>
      ) : (
        <div>
          <SplitPanes split="vertical" onResize={handleResize}>
            <SplitPanes.Pane
              aria-label="tree"
              initialSize="180px"
              min="24px"
              max="240px"
            >
              {data.columns && (
                <TreeEditor
                  rows={data.rows}
                  columns={data.columns}
                  isOpen={isShownTree}
                  ref={treeEditorRef}
                />
              )}
            </SplitPanes.Pane>
            <SplitPanes.Pane aria-label="table">
              <div className="content">
                <div>
                  <div className="result__table-content">
                    <div className="result__top">
                      <ChoiceGroup
                        value={fluidType}
                        items={FLUID_TYPES}
                        name="FluidTypesChoiceGroup"
                        className="FluidTypesChoiceGroup"
                        size="s"
                        multiple={false}
                        getLabel={(item) => item}
                        onChange={({ value }) => handleChangeFluidType(value)}
                      />

                      <div className="result__icons">
                        <span className="result__icon">
                          <Checkbox
                            view="primary"
                            checked={openSensitiveAnalysis}
                            onChange={({ checked }) =>
                              dispatch(
                                SettingsActions.setOpenSensitiveAnalysis(
                                  checked,
                                ),
                              )
                            }
                            label="Открывать анализ чувствительности"
                          />
                        </span>

                        <span ref={settingsRef} className="result__icon">
                          <IconDownload
                            onClick={() => downloadResult()}
                            size="m"
                          />
                        </span>

                        <span className="result__icon">
                          {showHistogram ? (
                            <IconExpand
                              onClick={() =>
                                dispatch(
                                  SettingsActions.setShowHistogram(false),
                                )
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
                    <div
                      className={`result__table ${
                        showHistogram ? '' : 'result__table_full'
                      }`}
                    >
                      <Table />
                    </div>
                  </div>

                  <div
                    className={`result__graphs ${
                      !showHistogram ? 'result__graphs_hide' : ''
                    }`}
                  >
                    {data && data?.columns?.length > 0 && (
                      <div>
                        <HistogramComponent grid={data} />
                      </div>
                    )}
                  </div>

                  {openSensitiveAnalysis && (
                    <Sidebar
                      isOpen={sidebarRow !== undefined}
                      onClickOutside={() =>
                        dispatch(TableActions.resetSidebarRow())
                      }
                      hasOverlay
                      className="result__sidebar"
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

          <NotifyComponent />
          <TableErrorAlert />
        </div>
      )}
    </div>
  );
};

export default RbResultPage;
