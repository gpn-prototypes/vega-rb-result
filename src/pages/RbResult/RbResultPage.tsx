import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SplitPanes,
  useInterval,
  useSidebar,
} from '@gpn-prototypes/vega-ui';
import {
  CategoryIcon,
  GridColumn,
  SelectedCell,
  TableEntities,
} from 'components/ExcelTable';
import { TableErrorAlert } from '@app/components/TableErrorAlert';
import projectService from '@app/services/ProjectService';
import competitiveAccessDuck from '@app/store/competitiveAccessDuck';
import projectDuck from '@app/store/projectDuck';
import tableDuck from 'store/tableDuck';
import { RootState } from '@app/store/types';
import { Nullable } from '@app/types';

import Table from '@app/components/TableResultRbController';
import TreeEditor from '@app/components/TreeEditor';

import style from './RbResultPage.css';

const RbResultPage: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedCell, setSelectedCell] = useState<Nullable<SelectedCell>>(
    null,
  );
  const treeEditorRef = useRef<HTMLDivElement>(null);
  const [isShownTree, setIsShownTree] = useState(true);

  const handleResize = (): void => {
    if (treeEditorRef?.current?.clientWidth) {
      setIsShownTree(Number(treeEditorRef?.current?.clientWidth) > 120);
    }
  };

  const data = useSelector(({ table }: RootState) => table);

  const isRecentlyEdited = useSelector(
    ({ competitiveAccess }: RootState) => competitiveAccess.isRecentlyEdited,
  );

  const {
    state: { isOpen },
    close: handleClose,
    open: handleOpen,
  } = useSidebar({
    isOpen: false,
    isMinimized: false,
  });


  useEffect(() => {
    projectService
      .getProjectName()
      .then((projectName) =>
        dispatch(projectDuck.actions.updateProjectName(projectName)),
      );
  }, [dispatch]);

  useInterval(30000, () => {
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
    <div className={style.SchemePage}>
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
        <SplitPanes.Pane aria-label="table">
          <div className={style.Content}>
            <div className={style.LeftPanel}>
              <Table onSelect={setSelectedCell} />
            </div>
          </div>
        </SplitPanes.Pane>
      </SplitPanes>
      <TableErrorAlert />
    </div>
  );
};

export default RbResultPage;

