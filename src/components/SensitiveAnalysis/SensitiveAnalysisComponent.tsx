import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DomainEntityCode } from '@app/constants/GeneralConstants';
import { MenuContextItem } from '@app/interfaces/ContextMenuInterface';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import { loadSensitiveAnalysisData } from '@app/services/sensitiveAnalysisService';
import sensitiveAnalysisDuck from '@app/store/sensitiveAnalysisDuck';
import { RootState } from '@app/store/types';
import { GridActiveRow, GridCollection } from '@app/types/typesTable';
import { Loader } from '@consta/uikit/Loader';
import { useMount } from '@gpn-prototypes/vega-ui';

import { VerticalMoreContextMenu } from '../Helpers/ContextMenuHelper';

import { SensitiveAnalysisChartComponent } from './chart/Chart';

import './SensitiveAnalysisComponent.css';

interface Props {
  grid: GridCollection;
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

export const SensitiveAnalysisComponent: React.FC<Props> = ({ grid }) => {
  const dispatch = useDispatch();
  const activeRow: GridActiveRow | undefined = useSelector(
    ({ table }: RootState) => table.activeRow,
  );
  const sensitiveAnalysisData: SensitiveAnalysis | undefined = useSelector(
    ({ sensitiveAnalysis }: RootState) => sensitiveAnalysis.payload,
  );

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [menuItems, setMenuItems] =
    useState<MenuContextItem[]>(payloadMenuItems);

  useMount(() => {
    return () => {
      dispatch(sensitiveAnalysisDuck.actions.resetState());
    };
  });

  /** Отлавливаем выбор ячейки */
  useEffect(() => {
    if (
      activeRow?.code &&
      activeRow?.code.indexOf(DomainEntityCode.Layer) > -1
    ) {
      setIsAvailable(true);
      setIsLoading(true);

      loadSensitiveAnalysisData(dispatch, activeRow.title.split(',')).then(() =>
        setIsLoading(false),
      );
    } else {
      setIsAvailable(false);
      setIsLoading(false);
    }
  }, [activeRow, setIsAvailable, dispatch]);

  const handleChange = (item: MenuContextItem) => {
    const updatedMenuItems = menuItems.map((menuItem: MenuContextItem) => {
      const cloneItem = { ...menuItem };

      if (cloneItem.code === item.code) {
        cloneItem.switch = !menuItem.switch;
      }

      return cloneItem;
    });

    setMenuItems(updatedMenuItems);
  };

  const handleClick = (item: MenuContextItem) => {
    console.log('handle click', item);
  };

  const chart = (
    <div className="sensitive-analysis__content">
      {sensitiveAnalysisData && (
        <SensitiveAnalysisChartComponent
          percentiles={sensitiveAnalysisData.percentiles}
          sample={sensitiveAnalysisData.sample}
          names={sensitiveAnalysisData.names}
          zeroPoint={sensitiveAnalysisData.zeroPoint}
        />
      )}
    </div>
  );

  const available = (
    <div>
      <VerticalMoreContextMenu
        menuItems={menuItems}
        title="Анализ чувствительности"
        onChange={handleChange}
        onClick={handleClick}
      />
      {isLoading ? <Loader className="sensitive-analysis__loader" /> : chart}
    </div>
  );

  const notAvailable = (
    <div className="sensitive-analysis__not-available">
      Необходимо выбрать Пласт как активную строку
    </div>
  );

  return (
    <div className="sensitive-analysis">
      {isAvailable ? available : notAvailable}
    </div>
  );
};
