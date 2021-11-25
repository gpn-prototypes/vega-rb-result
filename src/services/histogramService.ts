import { Histogram, HistogramStatistic } from '@app/generated/graphql';
import projectService from '@app/services/ProjectService';
import { Action } from 'redux';

export async function loadHistogramData(
  setHistograms: (histograms: Histogram[]) => Action,
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
    setHistograms(data.getHistograms.histograms);
  }
}

export async function loadHistogramStatisticData(
  setStatistics: (histograms: HistogramStatistic[]) => Action,
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
    setStatistics(statistics);
  }
}
