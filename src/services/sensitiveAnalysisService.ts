import { Dispatch } from 'react';

import projectService from '@app/services/ProjectService';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';

export async function loadSensitiveAnalysisData(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  const data = await projectService.getSensitiveAnalysisData(domainEntityNames);

  if (data) {
    dispatch(sensitiveAnalysisDuck.actions.setSensitiveAnalysis({ payload: data.getSensitivityAnalysis }));
  }

  return;
}
