/* eslint-disable no-param-reassign */
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';
import { SensitiveAnalysisChart } from './drawUtils';

import './Chart.css';

const PER_ELEMENT_HEIGHT = 66.6;

type Sorted = {
  range: number;
  index: number;
};

export const SensitiveAnalysisChartComponent: FC<
  SensitiveAnalysis & { availableNames: string[] }
> = ({ names, percentiles, resultMinMax, zeroPoint, availableNames }) => {
  const d3Container = useRef(null);

  /**
   * Необходимо собрать объект, собираем все значения из percentiles и мапим их по названию
   */
  const [currentPercentiles, setCurrentPercentiles] =
    useState<number[][]>(percentiles);
  const [currentHeight, setCurrentHeight] = useState<number>(
    currentPercentiles.length * PER_ELEMENT_HEIGHT,
  );

  useEffect(() => {
    /**
     * Пока что нет сортировки на backend, приходится вручную сортировать все
     * Сортируем путям вычитания максимального значения из минимального
     * И полученный результат сортируем с сохранением индекса у изначальных данных
     */
    const resultSorted: Sorted[] = resultMinMax.map(
      (result: number[], index: number) => ({
        range: result[1] - result[0],
        index,
      }),
    );
    // .sort((a: Sorted, b: Sorted) => {
    //   if (a.range < b.range) {
    //     return -1;
    //   }
    //
    //   if (a.range > b.range) {
    //     return 1;
    //   }
    //
    //   return 0;
    // })
    // .reverse();

    const result = resultSorted
      .map(({ index }) => percentiles[index])
      .filter((percent: number[], index: number) => {
        return availableNames.includes(names[index]);
      });

    setCurrentPercentiles(result);

    setCurrentHeight(
      result.length * PER_ELEMENT_HEIGHT > 150
        ? result.length * PER_ELEMENT_HEIGHT
        : 150,
    );
  }, [
    availableNames,
    percentiles,
    resultMinMax,
    setCurrentPercentiles,
    setCurrentHeight,
    names,
  ]);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    const data: SensitiveAnalysisChart.Payload[] = [];

    let cloneResultMinMax = [...resultMinMax];

    cloneResultMinMax = resultMinMax.filter((result: number[], index: number) =>
      availableNames.includes(names[index]),
    );

    cloneResultMinMax.forEach((result: number[], index) => {
      result.forEach((currentResult: number, innerIndex: number) => {
        data.push({
          name: names[index],
          value:
            innerIndex === 0
              ? zeroPoint - currentResult
              : currentResult - zeroPoint,
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
      resultMinMax: cloneResultMinMax,
      bias,
    });

    const { xAxis, yAxis, y2Axis, y3Axis } = SensitiveAnalysisChart.getAxis({
      xScale,
      x1Scale,
      yScale,
      options,
      resultMinMax: cloneResultMinMax,
      currentPercentiles,
      bias,
      series,
      zeroPoint,
      data,
    });

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
      .attr('rx', () => 2)
      .attr('width', (d) => xScale(d[1]) - xScale(d[0]))
      .attr('height', yScale.bandwidth())
      .append('title');

    svg.append('g').call(yAxis);
    svg.append('g').call(y2Axis);
    svg.append('g').call(y3Axis);
    svg.append('g').call(xAxis);
  }, [resultMinMax, currentPercentiles, names, availableNames, zeroPoint]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, currentPercentiles, availableNames]);

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
