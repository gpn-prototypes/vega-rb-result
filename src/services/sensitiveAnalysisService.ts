import { Dispatch } from 'react';
import projectService from '@app/services/ProjectService';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';
// import mockedData from '../mocks/sensitiveAnalysis.json';
import mockedDataM from '../mocks/sensitiveAnalysisMixture.json';

export async function loadSensitiveAnalysisData(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  try {
    // const data = await projectService.getSensitiveAnalysisData(domainEntityNames);
    // console.log(data.getSensitivityAnalysis, 'data')
    // console.log(mockedDataM, 'mockedDataM')
    dispatch(sensitiveAnalysisDuck.actions.setSensitiveAnalysis(mockedDataM));
  } catch (e) {
    throw new Error('getSensitiveAnalysisData request failed');
  }
}

export async function loadSensitiveAnalysisStatistic(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  try {
    const data = await projectService.getSensitiveAnalysisStatistic(domainEntityNames);
    // console.log(data, 'dataS')
    dispatch(sensitiveAnalysisDuck.actions.setSensitiveAnalysisStatistic(data.getSensitivityAnalysisStatistics));
  } catch (e) {
    throw new Error('getSensitiveAnalysisStatistic request failed');
  }
}
