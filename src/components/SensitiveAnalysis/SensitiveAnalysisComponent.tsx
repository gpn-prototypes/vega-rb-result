import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EFluidType } from '@app/constants/Enums';
import {
  MenuContextItem,
  MenuContextItemAnalysis,
  MenuContextItemSwitchAnalysis,
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
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Loader } from '@consta/uikit/Loader';
import { Sidebar } from '@consta/uikit/Sidebar';
import { useMount } from '@gpn-prototypes/vega-ui';
import cn from 'classnames';

import { VerticalMoreContextMenu } from '../Helpers/ContextMenuHelper';

import { SensitiveAnalysisChartComponent } from './chart/Chart';
import { SensitiveAnalysisStatisticComponent } from './statistic/SensitiveAnalysisStatisticComponent';

import './SensitiveAnalysisComponent.css';

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
  const sensitiveAnalysisStatisticData:
    | SensitiveAnalysisStatistic[]
    | undefined = useSelector(
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
    /** Заполняем пункты меню данными из бека */
    if (!sensitiveAnalysisData) {
      return;
    }

    const items: MenuContextItemAnalysis[][] = [];

    for (let i = 0; i < sensitiveAnalysisData.length; i += 1) {
      const { title } = sensitiveAnalysisData[i];

      const mappedNames =
        sensitiveAnalysisData[i].names.map((name: string) => {
          return {
            name,
            code: name,
            switch: true,
            id: Math.random() * 800 - 1,
          };
        }) || [];

      items.push([
        { title, ...mappedNames },
        payloadMenuItem,
      ] as MenuContextItemAnalysis[]);
    }

    setMenuItems(items);

    const availableTabsItems: string[] = [];

    sensitiveAnalysisData.forEach((i) => availableTabsItems.push(i.title));
    setAvailableTabs(availableTabsItems);

    // Изначально активный таб
    if (availableTabsItems.includes(EFluidType.OIL)) {
      setActiveTab(EFluidType.OIL);
    }
  }, [sensitiveAnalysisData]);

  // На изменение свичей
  const handleChange = (item: MenuContextItemSwitchAnalysis) => {
    const updatedMenuItems = menuItems.map((i) =>
      i.map((k, index) => {
        const cloneItem: any = { ...k };

        if (index === 0) {
          Object.values(cloneItem).map((j: any) => {
            if (j.code === item.code) {
              return Object.values(cloneItem).map((a: any, cloneItemIndex) => {
                // eslint-disable-next-line no-return-assign
                return a.code === item.code && a.id === item.id
                  ? (cloneItem[cloneItemIndex].switch = !a.switch)
                  : a;
              });
            }
            return null;
          });
        } else if (index === 1) {
          if (item.code === 'stat' && cloneItem.code === 'stat') {
            cloneItem.switch = !k.switch;
            setIsShowStatistic(cloneItem.switch);
          }
        }
        return cloneItem;
      }),
    );

    setMenuItems(updatedMenuItems);
  };

  const getAvailableNames = (index: number): string[] => {
    const result: string[] = [];

    if (index === 0) {
      const names = Object.values(menuItems[index][0])
        .filter((i) => typeof i !== 'string')
        .filter((j) => j.switch);

      names.forEach((i: any) => result.push(i.name));

      menuItems
        .filter((item: MenuContextItemAnalysis[]) => item[0].code !== 'stat')
        .filter((item: MenuContextItemAnalysis[]) => item[0].switch)
        .forEach((item: MenuContextItemAnalysis[]) => {
          return result.push(item[0].name ? item[0].name : '');
        });
    } else if (index === 1) {
      const names = Object.values(menuItems[index][0])
        .filter((i) => typeof i !== 'string')
        .filter((j) => j.switch);

      names.forEach((i) => result.push(i.name));

      menuItems
        .filter((item: MenuContextItemAnalysis[]) => item[1].code !== 'stat')
        .filter((item: MenuContextItemAnalysis[]) => item[1].switch);

      names.forEach((i) => result.push(i.name));
    }

    return result;
  };

  const chart = sensitiveAnalysisData?.length
    ? sensitiveAnalysisData.map((i, index) => {
        return activeTab === i.title ? (
          <div key={i.title}>
            <SensitiveAnalysisChartComponent
              percentiles={i.percentiles}
              resultMinMax={i.resultMinMax}
              names={i.names}
              zeroPoint={i.zeroPoint}
              availableNames={getAvailableNames(index)}
            />
          </div>
        ) : null;
      })
    : null;

  const statistic = (
    <div className={cn('sensitive-analysis')}>
      <div>
        <div className={cn('sensitive-analysis__title')}>Статистика</div>
        {isLoadingStatistic || !sensitiveAnalysisStatisticData ? (
          <Loader />
        ) : (
          <SensitiveAnalysisStatisticComponent
            statistic={
              sensitiveAnalysisStatisticData[
                activeTab === EFluidType.OIL ? 0 : 1
              ]
            }
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('sensitive-analysis')}>
      <Sidebar.Content>
        <div className={cn('sensitive-analysis__title')}>
          <VerticalMoreContextMenu
            menuItems={menuItems}
            title="Анализ чувствительности"
            onChange={handleChange}
          />
          <Button
            view="ghost"
            onClick={resetSidebarRow}
            width="default"
            form="default"
            label="Закрыть"
            size="m"
          />
        </div>

        <div className={cn('sensitive-analysis__content')}>
          {menuItems.length > 1 ? (
            <div className="tabsWrapper">
              <ChoiceGroup
                value={activeTab}
                items={availableTabs}
                name="SensitiveAnaLysisChoiceGroup"
                className={cn('SensitiveAnaLysisChoiceGroup')}
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
          <>
            {/* График */}
            {isLoading ? (
              <Loader className={cn('sensitive-analysis__loader')} />
            ) : (
              chart
            )}
          </>
          {/* Статистика */}
          {isShowStatistic ? statistic : null}
        </div>
      </Sidebar.Content>
    </div>
  );
};
