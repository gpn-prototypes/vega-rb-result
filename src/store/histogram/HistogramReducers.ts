import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { HistogramActions, HistogramStore } from './HistogramActions';

export const DEFAULT_NUMBER_OF_ROWS = 50;

export const histogramInitialState: HistogramStore = {
  numberOfRows: DEFAULT_NUMBER_OF_ROWS,
  isShowStatistic: false,
  menuItems: [
    {
      name: 'Кол-во столбцов в гистограмме',
      code: 'numberOfRows',
      choice: {
        value: DEFAULT_NUMBER_OF_ROWS,
        values: [25, DEFAULT_NUMBER_OF_ROWS, 100],
      },
    },
    {
      name: 'Показывать статистику',
      code: 'stat',
      switch: false,
      border: true,
    },
  ],
  histograms: [],
  statistics: [],
};

export const HistogramReducers = reducerWithInitialState<HistogramStore>(
  histogramInitialState,
)
  .case(HistogramActions.initState, (state, payload: HistogramStore) => payload)
  .case(HistogramActions.resetState, () => histogramInitialState)
  .case(HistogramActions.setHistograms, (state, histograms) => {
    return {
      ...state,
      ...{ histograms },
    };
  })
  .case(HistogramActions.setStatistics, (state, statistics) => ({
    ...state,
    ...{ statistics },
  }))
  .case(HistogramActions.updateMenuItem, (state, item: MenuContextItem) => {
    const cloneState = { ...state };

    if (item.code === 'stat') {
      const updatedMenuItems = state.menuItems.map(
        (menuItem: MenuContextItem) => {
          const newItem = { ...menuItem };

          if (menuItem.code === 'stat') {
            newItem.switch = !item.switch;

            cloneState.isShowStatistic = newItem.switch;
          }

          return newItem;
        },
      );

      return {
        ...cloneState,
        ...{ menuItems: updatedMenuItems },
      };
    }

    return state;
  })
  .case(
    HistogramActions.setNumberOfRows,
    (state, numberOfRows: number | undefined) => ({
      ...state,
      ...{ numberOfRows: numberOfRows || DEFAULT_NUMBER_OF_ROWS },
    }),
  );
