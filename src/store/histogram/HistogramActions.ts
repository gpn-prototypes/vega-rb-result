import { Histogram, HistogramStatistic } from '@app/generated/graphql';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('histogram');

export type HistogramStore = {
  numberOfRows: number;
  isShowStatistic: boolean;
  menuItems: MenuContextItem[];
  histograms: Histogram[];
  statistics: HistogramStatistic[];
};

export const HistogramActions = {
  initState: factory<HistogramStore>('HISTOGRAM/INIT_STATE'),
  resetState: factory<void>('HISTOGRAM/RESET_STATE'),
  updateMenuItem: factory<MenuContextItem>('HISTOGRAM/UPDATE_MENU_ITEM'),
  loadStatistic: factory('HISTOGRAM/LOAD_STATISTIC'),
  setNumberOfRows: factory<number | undefined>('HISTOGRAM/SET_NUMBER_OF_ROWS'),
  setHistograms: factory<Histogram[]>('HISTOGRAM/SET_HISTOGRAMS'),
  setStatistics: factory<HistogramStatistic[]>('HISTOGRAM/SET_STATISTICS'),
};
