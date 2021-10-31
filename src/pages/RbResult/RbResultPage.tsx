import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HistogramComponent } from '@app/components/Histograms/HistogramComponent';
import { SensitiveAnalysisComponent } from '@app/components/SensitiveAnalysis/SensitiveAnalysisComponent';
import { TableErrorAlert } from '@app/components/TableErrorAlert';
import Table from '@app/components/TableResultRbController';
import TreeEditor from '@app/components/TreeEditor';
import { EFluidType } from '@app/constants/Enums';
import {
  FLUID_TYPES,
  IS_PROJECT_RECENTLY_EDITED_INTERVAL_IN_MS,
} from '@app/constants/GeneralConstants';
import projectService from '@app/services/ProjectService';
import competitiveAccessDuck from '@app/store/competitiveAccessDuck';
import projectDuck from '@app/store/projectDuck';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Sidebar } from '@consta/uikit/Sidebar';
import { Text } from '@consta/uikit/Text';
import { SplitPanes, useInterval } from '@gpn-prototypes/vega-ui';

import './RbResultPage.scss';

const RbResultPage: React.FC = () => {
  const dispatch = useDispatch();
  const treeEditorRef = useRef<HTMLDivElement>(null);
  const [isShownTree, setIsShownTree] = useState(true);
  const [fluidType, setFluidType] = useState<EFluidType>(EFluidType.ALL);

  const data: GridCollection = useSelector(({ table }: RootState) => table);
  const sidebarRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.sidebarRow,
  );

  const isRecentlyEdited = useSelector(
    ({ competitiveAccess }: RootState) => competitiveAccess.isRecentlyEdited,
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
                  <div>
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
                    <Table />
                  </div>

                  <div className="result__graphs">
                    {data && data?.columns?.length > 0 && (
                      <div>
                        <HistogramComponent grid={data} />
                      </div>
                    )}

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
                  </div>
                </div>
              </div>
            </SplitPanes.Pane>
          </SplitPanes>
          <TableErrorAlert />
        </div>
      )}
    </div>
  );
};

export default RbResultPage;
