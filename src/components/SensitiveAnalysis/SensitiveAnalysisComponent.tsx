import React , { useState, useEffect } from 'react';
import { Loader } from '@consta/uikit/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { useMount } from '@gpn-prototypes/vega-ui';
import { DomainEntityCode } from '@app/constants/GeneralConstants';

import './SensitiveAnalysisComponent.css';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';
import { loadSensitiveAnalysisData } from '@app/services/sensitiveAnalysisService';
import { VerticalMoreContextMenu } from '../Helpers/ContextMenuHelper';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { SensitiveAnalysisChartComponent } from './chart/Chart';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';

interface Props {
  table: GridCollection;
}

const payloadMenuItems: MenuContextItem[] = [
  {
    name: 'GRV',
    code: 'grv',
    switch: true,
  },
  {
    name: 'Показывать статистику',
    code: 'stat',
    switch: false,
  },
];

export const SensitiveAnalysisComponent: React.FC<Props> = ({ table }) => {
  const dispatch = useDispatch();
  const activeRow: GridActiveRow | undefined = useSelector(({ table }: RootState) => table.activeRow);
  const sensitiveAnalysisData: SensitiveAnalysis | undefined = useSelector(({ sensitiveAnalysis }: RootState) => sensitiveAnalysis.payload);

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [menuItems, setMenuItems] = useState<MenuContextItem[]>(payloadMenuItems);

  useMount(() => {
    return () => {
      dispatch(sensitiveAnalysisDuck.actions.resetState());
    };
  });

  /** Отлавливаем выбор ячейки */
  useEffect(() => {
    if (activeRow?.code && activeRow?.code.indexOf(DomainEntityCode.Layer) > -1) {
      setIsAvailable(true);
      setIsLoading(true);

      loadSensitiveAnalysisData(
        dispatch,
        activeRow.title.split(','),
      ).then(() => setIsLoading(false));
    } else {
      setIsAvailable(false);
      setIsLoading(false);
    }
  }, [activeRow, setIsAvailable]);

  const handleChange = (item: MenuContextItem) => {
    const updatedMenuItems = menuItems.map((menuItem: MenuContextItem) => {
      if (menuItem.code === item.code) {
        menuItem.switch = !menuItem.switch;
      }

      return menuItem;
    });

    setMenuItems(updatedMenuItems);
  }

  const handleClick = (item: MenuContextItem) => {
    console.log('handle click', item);
  }

  const available = <div>
    <VerticalMoreContextMenu
      menuItems={menuItems}
      title="Анализ чувствительности"
      onChange={handleChange}
      onClick={handleClick}
    />
    {isLoading
      ? <Loader className="sensitive-analysis__loader" />
      : <div className="sensitive-analysis__content">
        {sensitiveAnalysisData && <SensitiveAnalysisChartComponent
            percentiles={sensitiveAnalysisData.percentiles}
            sample={sensitiveAnalysisData.sample}
            names={sensitiveAnalysisData.names}
          />}
      </div>}
  </div>;

  const notAvailable = <div className="sensitive-analysis__not-available">Необходимо выбрать "Пласт" как активную строку</div>

  return <div className="sensitive-analysis">
    {
      isAvailable
        ? available
        : notAvailable
    }

  </div>
};
