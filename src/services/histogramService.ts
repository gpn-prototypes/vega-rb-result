import { Dispatch } from 'react';
import projectService from '@app/services/ProjectService';
import histogramDuck from '@app/store/histogramDuck';

export async function loadHistogramData(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
): Promise<void> {
  const data = await projectService.getHistogramData(domainEntityNames);

  if (data) {
    dispatch(
      histogramDuck.actions.setHistograms({
        payload: data.getHistograms.histograms,
      }),
    );
  }
}
