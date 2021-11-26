/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';
import { SensitiveAnalysisChart } from './drawUtils';

import './Chart.css';

const PER_ELEMENT_HEIGHT = 66.6;

export const SensitiveAnalysisChartComponent: React.FC<
  SensitiveAnalysis & { availableNames: string[] }
> = ({ names, percentiles, resultMinMax, zeroPoint, availableNames }) => {
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

    setCurrentHeight(
      result.length * PER_ELEMENT_HEIGHT > 150
        ? result.length * PER_ELEMENT_HEIGHT
        : 150,
    );
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

    let cloneResultMinMax = [...resultMinMax];

    cloneResultMinMax = resultMinMax
      .sort((a: number[], b: number[]) => {
        if (a[0] === b[0]) {
          return a[1] - b[1];
        }

        return b[0] - a[0];
      })
      .reverse()
      .filter((result: number[], index: number) =>
        availableNames.includes(names[index]),
      );

    cloneResultMinMax.forEach((result: number[], index: number) => {
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
      .attr('rx', (d) => 2)
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
  }, [draw, currentPercentiles]);

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
