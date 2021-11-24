import { Dispatch } from 'react';
import projectService from '@app/services/ProjectService';
import histogramDuck from '@app/store/histogramDuck';

export async function loadHistogramData(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
  bins: number,
  geoFluidType: string,
): Promise<void> {
  const data = await projectService.getHistogramData(
    domainEntityNames,
    bins,
    geoFluidType,
  );

  if (data) {
    dispatch(
      histogramDuck.actions.setHistograms(data.getHistograms.histograms),
    );
  }
}

export async function loadHistogramStatisticData(
  dispatch: Dispatch<unknown>,
  domainEntityNames: string[],
  bins: number,
  geoFluidType: string,
): Promise<void> {
  const statistics = await projectService.getHistogramStatisticsData(
    domainEntityNames,
    bins,
    geoFluidType,
  );

  if (statistics) {
    dispatch(histogramDuck.actions.setStatistics(statistics));
  }
}
