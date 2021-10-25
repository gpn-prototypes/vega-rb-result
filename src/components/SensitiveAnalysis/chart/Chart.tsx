/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';
import { SensitiveAnalysisChart } from './drawUtils';

import './Chart.scss';

const PER_ELEMENT_HEIGHT = 66.6;

export const SensitiveAnalysisChartComponent: React.FC<
  SensitiveAnalysis & { availableNames: string[] }
> = ({ names, percentiles, sample, zeroPoint, availableNames }) => {
  const d3Container = useRef(null);

  /**
   * Необходимо собрать объект, собираем все значения из percentales и мапим их по названию
   */
  const [currentPercentiles, setCurrentPercentiles] =
    useState<number[][]>(percentiles);
  const [currentHeight, setCurrentHeight] = useState<number>(
    currentPercentiles.length * PER_ELEMENT_HEIGHT,
  );

  useEffect(() => {
    const result = percentiles.filter((percent: number[], index: number) => {
      return availableNames.includes(names[index]);
    });

    setCurrentPercentiles(result);

    setCurrentHeight(result.length * PER_ELEMENT_HEIGHT);
  }, [
    availableNames,
    percentiles,
    setCurrentPercentiles,
    setCurrentHeight,
    names,
  ]);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    const data: SensitiveAnalysisChart.Payload[] = [];

    currentPercentiles.forEach((percentale: number[], index: number) => {
      percentale.forEach((percent: number, innerIndex: number) => {
        data.push({
          name: names[index],
          /** Для показа множу маленькие значения */
          value: percent < 100 ? percent * 1000 : percent,
          // value: percent,
          category: innerIndex === 0 ? 0 : 1,
        });
      });
    });

    const { series, bias, options } = SensitiveAnalysisChart.getAxisData(data);

    const getColor = (key) => {
      return options.colors[key];
    };

    const { xScale, x1Scale, yScale } = SensitiveAnalysisChart.getAxisScale({
      series,
      sample,
      bias,
    });

    const { xAxis, yAxis, y2Axis, y3Axis } = SensitiveAnalysisChart.getAxis({
      xScale,
      x1Scale,
      yScale,
      options,
      sample,
      currentPercentiles,
      bias,
      series,
    });

    /**
     * У нас отвязана ось X от графика. Но нам нужно, чтоб фиктивная ось X
     * Была связана с графиком, поэтому необходимо двигать X положения баров в графике
     * Для этого мы находим все элементы оси X, парсим, получая значения и позицию
     * После этого, нам необходимо высчитать процент zeroPoint от следующего шага
     * После получения процента, мы множим пред. позицию и выставляем начальную позицию баров
     */
    /** TODO: Под вопросом, нужно ли */
    // setTimeout(() => {
    //   const xAxisResult: { value: number; xPos: number }[] = [];

    //   document
    //     .querySelectorAll('.chart__xAxis g')
    //     .forEach((element: Element) => {
    //       const xPos = (element.getAttribute('transform') || '')
    //         .replace('translate(', '')
    //         .replace(')', '')
    //         .split(',')[0];

    //       xAxisResult.push({
    //         value: Number(element.textContent),
    //         xPos: Number(xPos),
    //       });
    //     });

    //   const nextFromZeroPoint = xAxisResult.findIndex((innerX) => {
    //     return innerX.value >= zeroPoint;
    //   });
    //   const zeroPointMultiplier = Math.round(
    //     100 - (zeroPoint / xAxisResult[nextFromZeroPoint].value) * 100,
    //   );
    //   const prevFromZeroPointXPos = xAxisResult[nextFromZeroPoint - 1].xPos;
    //   const zeroPointXPos = prevFromZeroPointXPos * zeroPointMultiplier;
    // });

    svg
      .append('g')
      .attr('class', 'chart__main')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', (d) => getColor(d.key))
      .selectAll('rect')
      .data((d) => d.map((v) => Object.assign(v, { key: d.key })))
      .join('rect')
      .attr('class', 'chart__bar')
      .attr('x', (d) => xScale(d[0]))
      .attr('y', ({ data: [name] }: any) => yScale(name) || 0)
      .attr('rx', (d) => 2)
      .attr('width', (d) => xScale(d[1]) - xScale(d[0]))
      .attr('height', yScale.bandwidth())
      .append('title');

    svg.append('g').call(yAxis);
    svg.append('g').call(y2Axis);
    svg.append('g').call(y3Axis);
    svg.append('g').call(xAxis);
  }, [sample, currentPercentiles, names]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, sample]);

  return (
    <div className="chart">
      <div className={cnChart()}>
        <svg
          width={
            SensitiveAnalysisChart.Width +
            SensitiveAnalysisChart.Margin.left +
            SensitiveAnalysisChart.Margin.right
          }
          height={
            currentHeight +
            SensitiveAnalysisChart.Margin.top +
            SensitiveAnalysisChart.Margin.bottom
          }
          ref={d3Container}
        />
      </div>
    </div>
  );
};
