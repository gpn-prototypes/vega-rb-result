import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SplitPanes, useInterval } from '@gpn-prototypes/vega-ui';
import { TableErrorAlert } from '@app/components/TableErrorAlert';
import projectService from '@app/services/ProjectService';
import competitiveAccessDuck from '@app/store/competitiveAccessDuck';
import projectDuck from '@app/store/projectDuck';
import { RootState } from '@app/store/types';

import Table from '@app/components/TableResultRbController';
import TreeEditor from '@app/components/TreeEditor';
import {
  FLUID_TYPES,
  IS_PROJECT_RECENTLY_EDITED_INTERVAL_IN_MS,
} from '@app/common/consts';
import { EFluidType } from '@app/common/enums';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';

import './RbResultPage.css';

const RbResultPage: React.FC = () => {
  const dispatch = useDispatch();
  const treeEditorRef = useRef<HTMLDivElement>(null);
  const [isShownTree, setIsShownTree] = useState(true);
  const [fluidType, setFluidType] = useState<EFluidType>(EFluidType.ALL);

  const handleResize = (): void => {
    if (treeEditorRef?.current?.clientWidth) {
      setIsShownTree(Number(treeEditorRef?.current?.clientWidth) > 120);
    }
  };

  const data = useSelector(({ table }: RootState) => table);

  const isRecentlyEdited = useSelector(
    ({ competitiveAccess }: RootState) => competitiveAccess.isRecentlyEdited,
  );

  useEffect(() => {
    projectService
      .getProjectName()
      .then((projectName) =>
        dispatch(projectDuck.actions.updateProjectName(projectName)),
      );
  }, []);

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
      <SplitPanes split="vertical" onResize={handleResize}>
        <SplitPanes.Pane
          aria-label="tree"
          initialSize="180px"
          min="24px"
          max="240px"
        >
          <TreeEditor
            rows={data.rows}
            columns={data.columns}
            isOpen={isShownTree}
            ref={treeEditorRef}
          />
        </SplitPanes.Pane>
        <SplitPanes.Pane aria-label="table" initialSize="600px">
          <div className="content">
            <div>
              <ChoiceGroup
                value={fluidType}
                items={FLUID_TYPES}
                name="FluidTypesChoiceGroup"
                className="FluidTypesChoiceGroup"
                size="xs"
                multiple={false}
                getLabel={(item) => item}
                onChange={({ value }) => setFluidType(value)}
              />
              <Table />
            </div>
          </div>
        </SplitPanes.Pane>
      </SplitPanes>
      <TableErrorAlert />
    </div>
  );
};

export default RbResultPage;
