import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MenuContextItem,
  MenuContextItemAnalysis,
} from '@app/interfaces/ContextMenuInterface';
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
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { EFluidType } from '@app/constants/Enums';

interface P {
  sidebarRow: GridActiveRow;
}

const payloadMenuItem: MenuContextItem = {
  name: 'Показывать статистику',
  code: 'stat',
  switch: true,
  border: true,
};

export const SensitiveAnalysisComponent: FC<P> = ({ sidebarRow }) => {
  const dispatch = useDispatch();

  // при клике вне окна
  const resetState = useCallback(() => {
    dispatch(sensitiveAnalysisDuck.actions.resetState());
    dispatch(TableActions.resetSidebarRow());
  }, [dispatch]);

  // при клике вне окна и кнопке закрыть
  const resetSidebarRow = useCallback(() => {
    dispatch(TableActions.resetSidebarRow());
  }, [dispatch]);

  // свичи из выпадающего окна
  const [menuItems, setMenuItems] = useState<MenuContextItemAnalysis[][]>([]);
  const sensitiveAnalysisData: SensitiveAnalysis[] | undefined = useSelector(
    ({ sensitiveAnalysis }: RootState) => sensitiveAnalysis.payload,
  );
  const sensitiveAnalysisStatisticData: SensitiveAnalysisStatistic | undefined =
    useSelector(
      ({ sensitiveAnalysis }: RootState) => sensitiveAnalysis.statistic,
    );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStatistic, setIsLoadingStatistic] = useState<boolean>(false);
  const [isShowStatistic, setIsShowStatistic] = useState<boolean>(true);

  const [availableTabs, setAvailableTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useMount(() => {
    setIsLoading(true);
    setIsLoadingStatistic(true);

    // загрузка диаграммы, без setIsLoading(false) не отобразится даже при успехе
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

  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    /** Заполняем пункты меню данными из бека */
    if (!sensitiveAnalysisData) {
      return;
    }

    const items: MenuContextItemAnalysis[][] = [];

    for (let i = 0; i < sensitiveAnalysisData.length; i++) {
      let title = sensitiveAnalysisData[i].title;

      const extendedItems =
        sensitiveAnalysisData[i].names.map((name: string) => {
          return {
            name,
            code: name,
            switch: true,
          };
        }) || [];

      items.push([{ title, ...extendedItems }]);
    }

    // items.push(payloadMenuItem);

    setMenuItems(items);
    // @ts-ignore
    window.menuItems = menuItems;

    const availableTabsItems: string[] = [];

    sensitiveAnalysisData.forEach((i) => availableTabsItems.push(i.title));
    setAvailableTabs(availableTabsItems);

    // Изначально активный таб
    availableTabsItems.includes(EFluidType.OIL) && setActiveTab(EFluidType.OIL);
  }, [sensitiveAnalysisData]);

  // вызывается на изменение свичей
  const handleChange = (item: MenuContextItem) => {
    // console.log('handleChange');
    // const updatedMenuItems = menuItems.map((menuItem: MenuContextItem) => {
    //   const cloneItem = { ...menuItem };
    //   if (cloneItem.code === item.code) {
    //     cloneItem.switch = !menuItem.switch;
    //
    //     if (cloneItem.code === 'stat') {
    //       setIsShowStatistic(cloneItem.switch);
    //     }
    //   }
    //
    //   return cloneItem;
    // });
    //
    // setMenuItems(updatedMenuItems);
  };

  const getAvailableNames = (): string[] => {
    const result: string[] = [];

    // menuItems?.length
    //   ? menuItems[0]
    //       .filter((item: MenuContextItemAnalysis) => item.code !== 'stat')
    //       .filter((item: MenuContextItemAnalysis) => item.switch === true)
    //       .forEach((item: MenuContextItemAnalysis) => {
    //         if (item.name != null) {
    //           result.push(item.name);
    //         }
    //       })
    //   : null;

    return result;
  };

  const chart = sensitiveAnalysisData?.length
    ? sensitiveAnalysisData.map((i) => {
        return (
          <SensitiveAnalysisChartComponent
            percentiles={i.percentiles}
            resultMinMax={i.resultMinMax}
            names={i.names}
            zeroPoint={i.zeroPoint}
            availableNames={getAvailableNames()}
            title={'fd'}
          />
        );
      })
    : null;

  const statistic = (
    <div className="sensitive-analysis">
      <div>
        <div className="sensitive-analysis__title">Статистика</div>

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

  // @ts-ignore
  return (
    <div className="sensitive-analysis">
      <Sidebar.Content>
        {/* График */}
        {console.log('render sa')}
        <div className="sensitive-analysis__title">
          <VerticalMoreContextMenu
            menuItems={menuItems}
            title="Анализ чувствительности"
            onChange={handleChange}
          />
        </div>

        <div className="sensitive-analysis__content">
          {menuItems.length > 1 ? (
            <div className="tabsWrapper">
              <ChoiceGroup
                value={activeTab}
                items={availableTabs}
                name="SensitiveAnaLysisChoiceGroup"
                className="SensitiveAnaLysisChoiceGroup"
                size="s"
                view="ghost"
                width="full"
                multiple={false}
                getLabel={(item) => item}
                onChange={({ value }) => setActiveTab(() => value)}
                data-testid="Sensitive-analysis-tabs"
              />
            </div>
          ) : null}
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
