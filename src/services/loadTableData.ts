import projectService from '@app/services/ProjectService';
import { GridCollection } from '@app/types/typesTable';
import { Action } from 'redux';

import { unpackTableData } from '../utils/unpackTableData';

export async function loadTableData(
  setTable: (table: GridCollection) => Action,
  setEntitiesCount: (count: number) => Action,
): Promise<void> {
  const projectVersion = projectService.version;
  const resourceBaseData = await projectService.getResourceBaseData();

  if (resourceBaseData) {
    setTable(
      unpackTableData(resourceBaseData, projectVersion, setEntitiesCount),
    );
  } else if (resourceBaseData === null) {
    throw new Error();
    // const structureTemplate = await projectService.getTableTemplate();
    // TODO: uncommnet
    // dispatchOnInit(structureTemplate);
  }
}
