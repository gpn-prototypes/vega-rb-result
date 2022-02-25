import { Dispatch } from 'react';
import projectService from '@app/services/ProjectService';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';

export async function loadSensitiveAnalysisData(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  try {
    const data = await projectService.getSensitiveAnalysisData(
      domainEntityNames,
    );

    dispatch(
      sensitiveAnalysisDuck.actions.setSensitiveAnalysis(
        data.getSensitivityAnalysis,
      ),
    );
  } catch (e) {
    throw new Error('getSensitiveAnalysisData request failed');
  }
}

export async function loadSensitiveAnalysisStatistic(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  try {
    const data = await projectService.getSensitiveAnalysisStatistic(
      domainEntityNames,
    );

    dispatch(
      sensitiveAnalysisDuck.actions.setSensitiveAnalysisStatistic(
        data.getSensitivityAnalysisStatistics,
      ),
    );
  } catch (e) {
    throw new Error('getSensitiveAnalysisStatistic request failed');
  }
}
