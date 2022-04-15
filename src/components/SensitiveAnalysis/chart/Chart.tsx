/* eslint-disable no-param-reassign, newline-per-chained-call */
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { DrawUtils } from '@app/components/SensitiveAnalysis/chart/drawUtils';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';

import './Chart.css';

const PER_ELEMENT_HEIGHT = 66.6;

export const SensitiveAnalysisChartComponent: FC<
  SensitiveAnalysis & { availableNames: string[] }
> = ({ names, percentiles, resultMinMax, zeroPoint, availableNames }) => {
  const d3Container = useRef(null);

  const [currentPercentiles, setCurrentPercentiles] =
    useState<number[][]>(percentiles);
  const [currentHeight, setCurrentHeight] = useState<number>(
    currentPercentiles.length * PER_ELEMENT_HEIGHT,
  );

  useEffect(() => {
    const result = resultMinMax
      .map((_, index) => percentiles[index])
      .filter((_, index) => {
        return availableNames.includes(names[index]);
      });

    setCurrentPercentiles(result);

    setCurrentHeight(
      result.length * PER_ELEMENT_HEIGHT > 150
        ? result.length * PER_ELEMENT_HEIGHT
        : 150,
    );
  }, [availableNames, percentiles, names, resultMinMax]);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим всё, для перерисовки графиков */
    svg.selectAll('*').remove();

    const data: DrawUtils.Payload[] = [];

    let cloneResultMinMax = [...resultMinMax];

    cloneResultMinMax = resultMinMax.filter((result: number[], index: number) =>
      availableNames.includes(names[index]),
    );

    cloneResultMinMax.forEach((result: number[], index: number) => {
      result.forEach((currentResult: number, innerIndex: number) => {
        data.push({
          name: availableNames[index],
          value: currentResult - zeroPoint, // сейчас если отриц, то рисует влево
          category: innerIndex === 0 ? 0 : 1,
          percentile: currentPercentiles[index]
            ? currentPercentiles[index][innerIndex]
            : 0,
        });
      });
    });

    const chart = DrawUtils.tornadoChart(
      data,
      zeroPoint,
      cloneResultMinMax,
      svg,
      availableNames,
      currentHeight,
    );

    // отдаём актуальные данные на рисовку
    svg.datum(data).call(chart);
  }, [
    availableNames,
    currentHeight,
    currentPercentiles,
    names,
    resultMinMax,
    zeroPoint,
  ]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, availableNames]);

  return (
    <div className="chart">
      <div className={cnChart()}>
        <svg ref={d3Container} />
      </div>
    </div>
  );
};
