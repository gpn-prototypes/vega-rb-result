import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import {
  loadSensitiveAnalysisData,
  loadSensitiveAnalysisStatistic,
} from '@app/services/sensitiveAnalysisService';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';
import tableDuck from '@app/store/tableDuck';
import { RootState } from '@app/store/types';
import { GridActiveRow } from '@app/types/typesTable';
import { Button } from '@consta/uikit/Button';
import { Loader } from '@consta/uikit/Loader';
import { Sidebar } from '@consta/uikit/Sidebar';
import { useMount } from '@gpn-prototypes/vega-ui';

import { VerticalMoreContextMenu } from '../Helpers/ContextMenuHelper';

import { SensitiveAnalysisChartComponent } from './chart/Chart';
import { SensitiveAnalysisStatisticComponent } from './statistic/SensitiveAnalysisStatisticComponent';

import './SensitiveAnalysisComponent.scss';

interface Props {
  sidebarRow: GridActiveRow;
}

const payloadMenuItem: MenuContextItem = {
  name: 'Показывать статистику',
  code: 'stat',
  switch: true,
};

export const SensitiveAnalysisComponent: React.FC<Props> = ({ sidebarRow }) => {
  const dispatch = useDispatch();
  const [menuItems, setMenuItems] = useState<MenuContextItem[]>([]);
  const sensitiveAnalysisData: SensitiveAnalysis | undefined = useSelector(
    ({ sensitiveAnalysis }: RootState) => sensitiveAnalysis.payload,
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

    return () => {
      dispatch(sensitiveAnalysisDuck.actions.resetState());
      dispatch(tableDuck.actions.resetSidebarRow());
    };
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

        setIsShowStatistic(cloneItem.switch);
      }

      return cloneItem;
    });

    setMenuItems(updatedMenuItems);
  };

  const handleClick = (item: MenuContextItem) => {
    console.log('handle click', item);
  };

  const handleClose = () => {
    dispatch(tableDuck.actions.resetSidebarRow());
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

  const chart = (
    <div className="sensitive-analysis__content">
      {sensitiveAnalysisData && (
        <SensitiveAnalysisChartComponent
          percentiles={sensitiveAnalysisData.percentiles}
          sample={sensitiveAnalysisData.sample}
          names={sensitiveAnalysisData.names}
          zeroPoint={sensitiveAnalysisData.zeroPoint}
          availableNames={getAvailableNames()}
        />
      )}
    </div>
  );

  return (
    <div className="sensitive-analysis">
      <Sidebar.Content>
        {/* График */}
        <div className="sensitive-analysis__title">
          <VerticalMoreContextMenu
            menuItems={menuItems}
            title="Анализ чувствительности"
            onChange={handleChange}
            onClick={handleClick}
          />
        </div>

        <div className="sensitive-analysis__content">
          {isLoading ? (
            <Loader className="sensitive-analysis__loader" />
          ) : (
            chart
          )}
        </div>

        {/* Статистика */}
        {isShowStatistic && sensitiveAnalysisData ? (
          <SensitiveAnalysisStatisticComponent
            statistic={sensitiveAnalysisData}
            isLoading={isLoadingStatistic}
          />
        ) : null}
      </Sidebar.Content>

      <Sidebar.Actions className="sensitive-analysis__actions">
        <Button onClick={handleClose} label="Закрыть" size="m" />
      </Sidebar.Actions>
    </div>
  );
};
