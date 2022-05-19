import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MenuContextGroup,
  MenuContextItem,
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
import { block } from 'bem-cn';

import { VerticalMoreContextMenu } from '../Helpers/VerticalMoreContextMenu/VerticalMoreContextMenu';

import { SensitiveAnalysisChartComponent } from './chart/Chart';
import { SensitiveAnalysisStatistics } from './statistic/SensitiveAnalysisStatistics';

import './SensitiveAnalysisComponent.css';

const cn = block('SensitiveAnalysis');

interface Props {
  sidebarRow: GridActiveRow;
}

type Tab = {
  idx: number;
  title: string;
};

const statisticMenuItem: MenuContextItem = {
  name: 'Показывать статистику',
  code: 'stat',
  switch: true,
  border: true,
};

export const SensitiveAnalysisComponent: FC<Props> = ({ sidebarRow }) => {
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

  const [menuItems, setMenuItems] = useState<MenuContextGroup[]>([]);
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

  const [tabItems, setTabItems] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

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

    const availableTabsItems: Tab[] = [];

    sensitiveAnalysisData.forEach(
      (sensitiveAnalysisElement: SensitiveAnalysis, index: number) =>
        availableTabsItems.push({
          idx: index,
          title: sensitiveAnalysisElement.title,
        }),
    );

    setTabItems(availableTabsItems);

    setActiveTab(availableTabsItems[0]);
  }, [sensitiveAnalysisData]);

  /** Смотрим за изменением активного таба и устанавливаем значения конкретных итемов */
  useEffect(() => {
    if (!sensitiveAnalysisData) {
      return;
    }

    const sensitiveAnalysisElement = sensitiveAnalysisData[activeTab?.idx || 0];
    const children: MenuContextItem[] =
      sensitiveAnalysisElement.names.map((name: string) => {
        return {
          name,
          code: `${sensitiveAnalysisElement.title}__${name}`,
          switch: true,
        };
      }) || [];

    const menuContextGroup: MenuContextGroup[] = [
      {
        id: 0,
        title: sensitiveAnalysisElement.title,
        children,
      },
    ];

    menuContextGroup[0].children.push(statisticMenuItem);

    setMenuItems(menuContextGroup);
  }, [activeTab, sensitiveAnalysisData]);

  // На изменение свичей
  const handleChange = (item: MenuContextItem) => {
    // TODO: подумать над вынесением в хелпер
    const updatedMenuItems = menuItems.map((menuGroupItem) => {
      const cloneMenuGroupItem = { ...menuGroupItem };

      const changingItem = cloneMenuGroupItem.children.find(
        (menuItem) => menuItem.code === item.code,
      );

      menuGroupItem.children.forEach(
        // eslint-disable-next-line no-return-assign
        (menuContextItem) => {
          if (changingItem && menuContextItem.code === item.code) {
            changingItem.switch = !item.switch;
            if (item.code === 'stat') {
              setIsShowStatistic(() => !!item.switch);
            }
          }
        },
      );

      return cloneMenuGroupItem;
    });

    setMenuItems(updatedMenuItems);
  };

  const isDisplayMixtureFluid = useMemo(() => {
    return sensitiveAnalysisData && sensitiveAnalysisData.length > 1;
  }, [sensitiveAnalysisData]);

  const handleClick = (item: MenuContextItem) => {
    console.info('DEV: handle click', item);
  };

  const getAvailableNames = (data: MenuContextGroup[]): string[] => {
    const result: string[][] = [];

    data.forEach((menuContextGroup) => {
      const names: string[] = [];

      menuContextGroup.children
        .filter((menuContextItem) => menuContextItem.code !== 'stat')
        .filter((menuContextItem) => menuContextItem.switch)
        .forEach((menuContextItem) => names.push(menuContextItem.name));

      return result.push(names);
    });

    return result[0];
  };

  const chart = sensitiveAnalysisData?.length
    ? sensitiveAnalysisData.map((sensitiveAnalysisItem) => {
        return activeTab?.title === sensitiveAnalysisItem.title ? (
          <div key={sensitiveAnalysisItem.title}>
            <SensitiveAnalysisChartComponent
              percentiles={sensitiveAnalysisItem.percentiles}
              resultMinMax={sensitiveAnalysisItem.resultMinMax}
              names={sensitiveAnalysisItem.names}
              zeroPoint={sensitiveAnalysisItem.zeroPoint}
              availableNames={getAvailableNames(menuItems)}
              title=""
            />
          </div>
        ) : null;
      })
    : null;

  const statistic = (
    <div className={cn()}>
      <div className={cn('Statistic')}>
        {isLoadingStatistic || !sensitiveAnalysisStatisticData ? (
          <Loader />
        ) : (
          <SensitiveAnalysisStatistics
            statistic={sensitiveAnalysisStatisticData[activeTab?.idx || 0]}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={cn()}>
      <Sidebar.Content className={cn('Sidebar')}>
        <div className={cn('Title')}>
          <VerticalMoreContextMenu
            groupItems={menuItems}
            title="Анализ чувствительности"
            onChange={handleChange}
            loading={isLoading}
            onClick={handleClick}
          />

          {isDisplayMixtureFluid ? (
            <div className={cn('Tabs')}>
              <ChoiceGroup
                value={activeTab}
                items={tabItems}
                name="SensitiveAnalysisChoiceGroup"
                size="s"
                view="ghost"
                width="full"
                multiple={false}
                getLabel={(item) => item.title}
                onChange={({ value }) => setActiveTab(() => value)}
                data-testid="Sensitive-analysis-tabs"
              />
            </div>
          ) : null}

          <Button
            view="ghost"
            onClick={resetSidebarRow}
            width="default"
            form="default"
            label="Закрыть"
            size="s"
            data-testid="sensitive-analysis-close"
          />
        </div>

        <div className={cn('Content')}>
          {/* График */}
          {isLoading ? <Loader className={cn('Loader')} /> : chart}

          {/* Статистика */}
          {isShowStatistic ? statistic : null}
        </div>
      </Sidebar.Content>
    </div>
  );
};
