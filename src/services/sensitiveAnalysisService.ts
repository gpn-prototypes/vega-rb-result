import { Dispatch } from 'react';
import projectService from '@app/services/ProjectService';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';

export async function loadSensitiveAnalysisData(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  const data = await projectService.getSensitiveAnalysisData(domainEntityNames);

  if (data) {
    dispatch(
      sensitiveAnalysisDuck.actions.setSensitiveAnalysis(
        data.getSensitivityAnalysis,
      ),
    );
  }
}

export async function loadSensitiveAnalysisStatistic(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  const data = await projectService.getSensitiveAnalysisStatistic(
    domainEntityNames,
  );

  if (data) {
    dispatch(
      sensitiveAnalysisDuck.actions.setSensitiveAnalysisStatistic(
        data.getSensitivityAnalysisStatistics,
      ),
    );
  }
}
