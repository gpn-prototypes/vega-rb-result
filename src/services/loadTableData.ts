import { Dispatch } from 'react';
import { ResultProjectStructure } from '@app/generated/graphql';
import projectService from '@app/services/ProjectService';
import tableDuck from '@app/store/tableDuck';
import { unpackTableData } from '../utils/unpackTableData';

const initAction = (template: ResultProjectStructure, version: number) =>
  tableDuck.actions.initState(unpackTableData(template, version));

export async function loadTableData(
  dispatch: Dispatch<unknown>,
): Promise<void> {
  const projectVersion = projectService.version;
  const resourceBaseData = await projectService.getResourceBaseData();

  const dispatchOnInit = (structure: ResultProjectStructure) =>
    dispatch(initAction(structure, projectVersion));

  if (resourceBaseData) {
    console.log('its true');
    dispatchOnInit(resourceBaseData);
  } else if (resourceBaseData === null) {
    const structureTemplate = await projectService.getTableTemplate();
    // TODO: uncommnet
    // dispatchOnInit(structureTemplate);
  }
}