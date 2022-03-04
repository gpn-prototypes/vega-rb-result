import { Histogram, HistogramStatistic } from '@app/generated/graphql';
import projectService from '@app/services/ProjectService';

export async function loadHistogramData(
  domainEntityNames: string[],
  bins: number,
): Promise<Histogram[]> {
  const data = await projectService.getHistogramData(domainEntityNames, bins);

  if (data) {
    return data.getHistograms.histograms;
  }

  return [];
}

export async function loadHistogramStatisticData(
  domainEntityNames: string[],
  bins: number,
): Promise<HistogramStatistic[]> {
  const statistics = await projectService.getHistogramStatisticsData(
    domainEntityNames,
    bins,
  );

  if (statistics) {
    return statistics;
  }

  return [];
}
