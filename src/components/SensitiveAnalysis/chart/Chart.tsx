import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';

import './Chart.css';
import { Chart } from './drawUtils';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';

interface Payload {
  name: string;
  value: number;
}

export const SensitiveAnalysisChartComponent: React.FC<SensitiveAnalysis> = ({ names, percentiles, sample }) => {
  const d3Container = useRef(null);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    const payload: Payload[] = [];

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

    // const categories = {
    //   "pants-fire": "Pants on fire!",
    //   "false": "False",
    //   "mostly-false": "Mostly false",
    //   "barely-true": "Mostly false", // recategorized
    //   "half-true": "Half true",
    //   "mostly-true": "Mostly true",
    //   "true": "True"
    // };

    // const data = d3.csvParse(await FileAttachment("politifact.csv").text(), ({speaker: name, ruling: category, count: value}) => categories[category] ? {name, category: categories[category], value: +value} : null);

    // Normalize absolute values to percentage.
    // d3.rollup(data, group => {
    //   const sum = d3.sum(group, d => d.value);
    //   for (const d of group) d.value /= sum;
    // }, d => d.name);

    // return Object.assign(data, {
    //   format: ".0%",
    //   negative: "← More falsehoods",
    //   positive: "More truths →",
    //   negatives: ["Pants on fire!", "False", "Mostly false"],
    //   positives: ["Half true", "Mostly true", "True"]
    // });

    // svg.append("g")
    //     .selectAll("g")
    //     .data(series)
    //     .join("g")
    //       .attr("fill", d => color(d.key))
    //     .selectAll("rect")
    //     .data(d => d.map(v => Object.assign(v, {key: d.key})))
    //     .join("rect")
    //       .attr("x", d => x(d[0]))
    //       .attr("y", ({data: [name]}) => y(name))
    //       .attr("width", d => x(d[1]) - x(d[0]))
    //       .attr("height", y.bandwidth())
    //     .append("title")
    //       .text(({key, data: [name, value]}) => `${name}
    // ${formatValue(value.get(key))} ${key}`);

    //   svg.append("g")
    //       .call(xAxis);

    //   svg.append("g")
    //       .call(yAxis);

    // /** Получаем основные данные и их распределение на гистограмме */
    // const { xScale, yScale, y1Scale, y2Scale } = Chart.getScales({ bins, numberOfIterationBin });

    // /** Получаем основные оси, на основе них будет сопастовление с данными выше */
    // const { xAxis, yAxis } = Chart.getMainAxis({ xScale, yScale, payload });

    // /** Получаем дополнительные(фейковые) оси, которые не привязанны к данным */
    // const { y1Axis, y2Axis } = Chart.getDummyAxis({ y1Scale, y2Scale, payload, numberOfIterationBin });

    // /** Рисуем график на основе данных */
    // Chart.DrawHistogram({ bins, svg, xScale, yScale });

    // /** Рисуем график на основе данных */
    // Chart.DrawDots({ svg, xScale, y1Scale, percentiles });

    // /** Добавляем все оси на гистограмму */
    // svg.append('g')
    //     .call(xAxis);

    // svg.append('g')
    //     .call(yAxis);

    // svg.append('g')
    //     .call(y1Axis);

    // svg.append('g')
    //     .call(y2Axis);
  }, [sample, percentiles, names]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, sample]);

  return (
    <div className='chart'>
      <div className={cnChart()}>
        <svg width={Chart.Width} height={Chart.Height} ref={d3Container} />
      </div>
    </div>
  );
};
