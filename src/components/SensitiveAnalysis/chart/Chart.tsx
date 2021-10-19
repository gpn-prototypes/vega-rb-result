import React, { useCallback, useEffect, useRef } from 'react';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';
import { SensitiveAnalysisChart } from './drawUtils';

interface Payload {
  name: string;
  value: number;
}

export const SensitiveAnalysisChartComponent: React.FC<SensitiveAnalysis> = ({
  names,
  percentiles,
  sample,
  zeroPoint,
}) => {
  const d3Container = useRef(null);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    const payload: Payload[] = [];
    console.log(sample, percentiles, names, zeroPoint);

    /**
     * Необходимо собрать объект, собираем все значения из percentales и мапим их по названию
     */
    percentiles.forEach((percentale: number[], index: number) => {
      percentale.forEach((percent: number) => {
        payload.push({
          name: names[index],
          value: percent,
        });
      });
    });
  }, [sample, percentiles, names, zeroPoint]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, sample]);

  return (
    <div className="chart">
      <div className={cnChart()}>
        <svg
          width={SensitiveAnalysisChart.Width}
          height={SensitiveAnalysisChart.Height}
          ref={d3Container}
        />
      </div>
    </div>
  );
};
