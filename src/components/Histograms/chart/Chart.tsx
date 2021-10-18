import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Bin } from 'd3-array';

import { cnChart } from './cn-chart';

import './Chart.css';
import { Histogram } from '@app/generated/graphql';
import { Chart } from './drawUtils';

const ChartComponent: React.FC<Histogram> = ({ title, subtitle, percentiles, sample, numberOfIterationBin }) => {
  const d3Container = useRef(null);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    /** Для создания чартов необходимо добавить в массив объект(это же js, комон) */
    const payload: Chart.Payload = Object.assign(sample, {x: '', y: ''});

    /** Создание бинов, это "бары", которые будут отображаться на графике */
    const bins: Bin<number, number>[] = d3
      .bin()
      .thresholds(50)(payload);

    /** Получаем основные данные и их распределение на гистограмме */
    const { xScale, yScale, y1Scale, y2Scale } = Chart.getScales({ bins, numberOfIterationBin });

    /** Получаем основные оси, на основе них будет сопастовление с данными выше */
    const { xAxis, yAxis } = Chart.getMainAxis({ xScale, yScale, payload });

    /** Получаем дополнительные(фейковые) оси, которые не привязанны к данным */
    const { y1Axis, y2Axis } = Chart.getDummyAxis({ y1Scale, y2Scale, payload, numberOfIterationBin });

    /** Рисуем график на основе данных */
    Chart.DrawHistogram({ bins, svg, xScale, yScale });

    /** Рисуем график на основе данных */
    Chart.DrawDots({ svg, xScale, y1Scale, percentiles });

    /** Добавляем все оси на гистограмму */
    svg.append('g')
        .call(xAxis);
    
    svg.append('g')
        .call(yAxis);

    svg.append('g')
        .call(y1Axis);

    svg.append('g')
        .call(y2Axis);
  }, [sample, percentiles]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, sample]);

  return (
    <div className='chart'>
      <div className='chart__description'>
        <div>{title}</div>
        <div>{subtitle}</div>
      </div>

      <div className={cnChart()}>
        <svg width={Chart.Width} height={Chart.Height} ref={d3Container} />
      </div>
    </div>
  );
};

export default ChartComponent;
