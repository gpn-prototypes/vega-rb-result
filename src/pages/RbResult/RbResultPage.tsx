import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CustomContextMenu } from '@app/components/Helpers/ContextMenuHelper';
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
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import projectService from '@app/services/ProjectService';
import { loadArchive } from '@app/services/utilsService';
import competitiveAccessDuck from '@app/store/competitiveAccessDuck';
import { NotifyActions } from '@app/store/notify/notifyActions';
import projectDuck from '@app/store/projectDuck';
import { SettingsActions } from '@app/store/settings/settingsActions';
import { openSensitiveAnalysisFromLocalStorage } from '@app/store/settings/settingsReducers';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { LocalStorageHelper } from '@app/utils/LocalStorageHelper';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { IconCollapse } from '@consta/uikit/IconCollapse';
import { IconDownload } from '@consta/uikit/IconDownload';
import { IconExpand } from '@consta/uikit/IconExpand';
import { IconSettings } from '@consta/uikit/IconSettings';
import { Position } from '@consta/uikit/Popover';
import { Sidebar } from '@consta/uikit/Sidebar';
import { Text } from '@consta/uikit/Text';
import { SplitPanes, useInterval } from '@gpn-prototypes/vega-ui';

import './RbResultPage.scss';

const payloadMenuItems: MenuContextItem[] = [
  {
    name: 'Открывать анализ чувствительности',
    code: 'analysis',
    switch: (() => openSensitiveAnalysisFromLocalStorage)(),
  },
];

const RbResultPage: React.FC = () => {
  const dispatch = useDispatch();
  const treeEditorRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isShownTree, setIsShownTree] = useState(true);
  const [isShownSettings, setIsShownSettings] = useState(false);
  const [fluidType, setFluidType] = useState<EFluidType>(EFluidType.ALL);
  const [menuItems, setMenuItems] =
    useState<MenuContextItem[]>(payloadMenuItems);

  const data: GridCollection = useSelector(({ table }: RootState) => table);
  const sidebarRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.sidebarRow,
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

  const handleResize = (): void => {
    if (treeEditorRef?.current?.clientWidth) {
      setIsShownTree(Number(treeEditorRef?.current?.clientWidth) > 120);
    }
  };

  const handleChangeFluidType = (type: EFluidType) => {
    dispatch(TableActions.setFluidType(type));

    setFluidType(type);
  };

  useEffect(() => {
    projectService
      .getProjectName()
      .then((projectName) =>
        dispatch(projectDuck.actions.updateProjectName(projectName)),
      );
  }, [dispatch]);

  useInterval(IS_PROJECT_RECENTLY_EDITED_INTERVAL_IN_MS, () => {
    projectService
      .getProjectRecentlyEdited()
      .then((recentlyEdited) => {
        if (recentlyEdited === isRecentlyEdited) {
          return;
        }
        dispatch(
          competitiveAccessDuck.actions.setRecentlyEdited(recentlyEdited),
        );
      })
      .catch(() => competitiveAccessDuck.actions.setRecentlyEdited(false));
  });

  const onChange = (item: MenuContextItem) => {
    const updatedMenuItems: MenuContextItem[] = menuItems.map(
      (menuItem: MenuContextItem) => {
        const newItem = { ...menuItem };

        if (menuItem.switch !== undefined && menuItem.code === item.code) {
          newItem.switch = !item.switch;
        }

        return newItem;
      },
    );

    setMenuItems(updatedMenuItems);

    const currentItem = updatedMenuItems.find((cur) => cur.code === item.code);

    switch (currentItem?.code) {
      case 'analysis': {
        dispatch(
          SettingsActions.setOpenSensitiveAnalysis(Boolean(currentItem.switch)),
        );

        break;
      }

      default:
        break;
    }
  };

  /** Установка позиции Popover */
  const getPosition = (): Position => {
    const rect: DOMRect | undefined =
      settingsRef.current?.getBoundingClientRect();

    return rect ? { x: rect.left, y: rect.bottom } : { x: 0, y: 0 };
  };

  const downloadResult = async (): Promise<void> => {
    try {
      dispatch(
        NotifyActions.appendItem({
          key: 'notify',
          message: 'Идет генерация файла',
          status: 'system',
        }),
      );

      /** Таймаут добавлен для того, что бы визуально не мелькала нотификация */
      setTimeout(async () => {
        await loadArchive(
          LocalStorageHelper.get(LocalStorageKey.ResultId) || '',
        );

        dispatch(NotifyActions.removeItem('notify'));
      }, 1500);
    } catch (e) {
      console.warn(e);
    }
  };

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

                        <span ref={settingsRef} className="result__icon">
                          <IconSettings
                            onClick={() => setIsShownSettings(true)}
                            size="m"
                          />
                        </span>
                      </div>

                      {isShownSettings && (
                        <CustomContextMenu
                          ref={settingsRef}
                          menuItems={() => (() => menuItems)()}
                          onChange={onChange}
                          position={getPosition()}
                          setIsOpenContextMenu={setIsShownSettings}
                        />
                      )}
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
