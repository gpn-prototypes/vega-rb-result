import { ResultProjectStructure } from '@app/generated/graphql';
import projectService from '@app/services/ProjectService';

export function loadTableData(): Promise<ResultProjectStructure> {
  return projectService.getResourceBaseData();
}
