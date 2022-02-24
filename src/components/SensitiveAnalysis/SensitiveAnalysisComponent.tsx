import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import {
  SensitiveAnalysis,
  SensitiveAnalysisStatistic,
} from '@app/interfaces/SensitiveAnalysisInterface';
import {
  loadSensitiveAnalysisData,
  loadSensitiveAnalysisStatistic,
} from '@app/services/sensitiveAnalysisService';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';
import { TableActions } from '@app/store/table/tableActions';
import { RootState } from '@app/store/types';
import { GridActiveRow } from '@app/types/typesTable';
import { Button } from '@consta/uikit/Button';
import { Loader } from '@consta/uikit/Loader';
import { Sidebar } from '@consta/uikit/Sidebar';
import { useMount } from '@gpn-prototypes/vega-ui';

import { VerticalMoreContextMenu } from '../Helpers/ContextMenuHelper';

import { SensitiveAnalysisChartComponent } from './chart/Chart';
import { SensitiveAnalysisStatisticComponent } from './statistic/SensitiveAnalysisStatisticComponent';

import './SensitiveAnalysisComponent.css';

interface Props {
  sidebarRow: GridActiveRow;
}

const payloadMenuItem: MenuContextItem = {
  name: 'Показывать статистику',
  code: 'stat',
  switch: true,
  border: true,
};

export const SensitiveAnalysisComponent: React.FC<Props> = ({ sidebarRow }) => {
  const dispatch = useDispatch();
  const resetState = useCallback(() => {
    dispatch(sensitiveAnalysisDuck.actions.resetState());
    dispatch(TableActions.resetSidebarRow());
  }, [dispatch]);
  const resetSidebarRow = useCallback(
    () => dispatch(TableActions.resetSidebarRow()),
    [dispatch],
  );

  const [menuItems, setMenuItems] = useState<MenuContextItem[]>([]);
  const sensitiveAnalysisData: SensitiveAnalysis | undefined = useSelector(
    ({ sensitiveAnalysis }: RootState) => sensitiveAnalysis.payload,
  );
  const sensitiveAnalysisStatisticData: SensitiveAnalysisStatistic | undefined =
    useSelector(
      ({ sensitiveAnalysis }: RootState) => sensitiveAnalysis.statistic,
    );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStatistic, setIsLoadingStatistic] = useState<boolean>(false);
  const [isShowStatistic, setIsShowStatistic] = useState<boolean>(true);

  useMount(() => {
    setIsLoading(true);
    setIsLoadingStatistic(true);

    loadSensitiveAnalysisData(dispatch, sidebarRow.title.split(',')).then(
      () => {
        setIsLoading(false);
      },
    );

    loadSensitiveAnalysisStatistic(dispatch, sidebarRow.title.split(',')).then(
      () => setIsLoadingStatistic(false),
    );

    return resetState;
  });

  useEffect(() => {
    /** Заполняем пункты меню, данными из бекенда */
    if (!sensitiveAnalysisData) {
      return;
    }

    const items: MenuContextItem[] =
      sensitiveAnalysisData.names.map((name: string) => {
        return {
          name,
          code: name,
          switch: true,
        };
      }) || [];

    items.push(payloadMenuItem);

    setMenuItems(items);
  }, [sensitiveAnalysisData]);

  const handleChange = (item: MenuContextItem) => {
    const updatedMenuItems = menuItems.map((menuItem: MenuContextItem) => {
      const cloneItem = { ...menuItem };

      if (cloneItem.code === item.code) {
        cloneItem.switch = !menuItem.switch;

        if (cloneItem.code === 'stat') {
          setIsShowStatistic(cloneItem.switch);
        }
      }

      return cloneItem;
    });

    setMenuItems(updatedMenuItems);
  };

  const handleClick = (item: MenuContextItem) => {
    console.info('DEV: handle click', item);
  };

  const getAvailableNames = (): string[] => {
    const result: string[] = [];

    menuItems
      .filter((item: MenuContextItem) => item.code !== 'stat')
      .filter((item: MenuContextItem) => item.switch === true)
      .forEach((item: MenuContextItem) => {
        result.push(item.name);
      });

    return result;
  };

  const chart = sensitiveAnalysisData && (
    <SensitiveAnalysisChartComponent
      percentiles={sensitiveAnalysisData.percentiles}
      resultMinMax={sensitiveAnalysisData.resultMinMax}
      names={sensitiveAnalysisData.names}
      zeroPoint={sensitiveAnalysisData.zeroPoint}
      availableNames={getAvailableNames()}
    />
  );

  const statistic = (
    <div className="sensitive-analysis">
      <div>
        <div className="sensitive-analysis__title sensitive-analysis__title--statistic">
          Статистика
        </div>

        {isLoadingStatistic || !sensitiveAnalysisStatisticData ? (
          <Loader />
        ) : (
          <SensitiveAnalysisStatisticComponent
            statistic={sensitiveAnalysisStatisticData}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="sensitive-analysis">
      <Sidebar.Content>
        {/* График */}
        <div className="sensitive-analysis__title">
          <VerticalMoreContextMenu
            menuItems={() => (() => menuItems)()}
            title="Анализ чувствительности"
            onChange={handleChange}
            onClick={handleClick}
          />
        </div>

        <div className="sensitive-analysis__content">
          <div>
            {isLoading ? (
              <Loader className="sensitive-analysis__loader" />
            ) : (
              chart
            )}
          </div>

          {/* Статистика */}
          {isShowStatistic ? statistic : null}
        </div>
      </Sidebar.Content>

      <Sidebar.Actions className="sensitive-analysis__actions">
        <Button onClick={resetSidebarRow} label="Закрыть" size="m" />
      </Sidebar.Actions>
    </div>
  );
};
