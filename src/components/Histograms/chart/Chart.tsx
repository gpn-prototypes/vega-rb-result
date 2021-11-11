import React, { useCallback, useEffect, useRef } from 'react';
import { Histogram } from '@app/generated/graphql';
import * as d3 from 'd3';
import { Bin } from 'd3-array';

import { cnChart } from './cn-chart';
import { Chart } from './drawUtils';

import './Chart.scss';

const ChartComponent: React.FC<
  Histogram & { numberOfRows: number; id: string }
> = ({
  title,
  subtitle,
  percentiles,
  sample,
  numberOfIterationBin,
  numberOfRows,
  cdf,
  id,
}) => {
  const d3Container = useRef(null);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    /** Для создания чартов необходимо добавить в массив объект(это же js, комон) */
    const payload: Chart.Payload = Object.assign(sample, { x: '', y: '' });

    /** Создание бинов, это "бары", которые будут отображаться на графике */
    const bins: Bin<number, number>[] = d3.bin().thresholds(numberOfRows)(
      payload,
    );

    /** Получение данных для линии выживаемости */
    const pdf = Chart.getPayload(cdf, sample);

    /** Получаем основные данные и их распределение на гистограмме */
    const {
      xScale,
      yScale,
      y1Scale,
      y2Scale,
      probabilityDensityXScale,
      probabilityDensityYScale,
    } = Chart.getScales({
      bins,
      numberOfIterationBin,
      pdf,
    });

    /** Получаем основные оси, на основе них будет сопастовление с данными выше */
    const { xAxis, yAxis } = Chart.getMainAxis({ xScale, yScale, payload });

    /** Получаем дополнительные(фейковые) оси, которые не привязанны к данным */
    const { y1Axis, y2Axis } = Chart.getDummyAxis({
      y1Scale,
      y2Scale,
      payload,
    });

    /** Рисуем график на основе данных */
    Chart.DrawHistogram({ bins, svg, xScale, yScale });

    /** Рисуем точки на основе данных */
    Chart.DrawDots({ svg, xScale, y1Scale, percentiles });

    /** Рисуем линию выживаемости */
    Chart.DrawSurvivalLine({
      probabilityDensityXScale,
      probabilityDensityYScale,
      svg,
      pdf,
      id,
    });

    /** Добавляем все оси на гистограмму */
    svg.append('g').call(xAxis);

    /** Рисуем основную ось Y, не видимая */
    svg.append('g').call(yAxis);

    /** Рисуем фиктивную ось Y, слева */
    svg.append('g').call(y1Axis);

    /** Рисуем фиктивную ось Y, справа */
    svg.append('g').call(y2Axis);
  }, [sample, percentiles, numberOfIterationBin, numberOfRows, cdf, id]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, sample]);

  return (
    <div className="chart">
      <div className="chart__description">
        <div>{title}</div>
        <div>{subtitle}</div>
      </div>

      <div className={cnChart()}>
        <svg
          width={Chart.DefaultWidth}
          height={Chart.DefaultHeight}
          ref={d3Container}
        />
      </div>
    </div>
  );
};

export default ChartComponent;
