import { Dispatch } from 'react';

import projectService from '@app/services/ProjectService';
import histogramDuck from '@app/store/histogramDuck';

export async function loadHistogramData(
  dispatch: Dispatch<unknown>,
  domainEntityCodes: string[],
  domainEntityNames: string[],
): Promise<void> {
  const data = await projectService.getHistogramData(domainEntityCodes, domainEntityNames);

  if (data) {
    dispatch(histogramDuck.actions.setHistograms({ payload: data.getHistograms.histograms }));
  }
}
