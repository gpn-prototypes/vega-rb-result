/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useRef } from 'react';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';
import { SensitiveAnalysisChart } from './drawUtils';

import './Chart.scss';

export const SensitiveAnalysisChartComponent: React.FC<
  SensitiveAnalysis & { availableNames: string[] }
> = ({ names, percentiles, sample, zeroPoint, availableNames }) => {
  const d3Container = useRef(null);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    const data: SensitiveAnalysisChart.Payload[] = [];

    console.log('reflow', availableNames);

    /**
     * Необходимо собрать объект, собираем все значения из percentales и мапим их по названию
     */
    percentiles
      .filter((percent: number[], index: number) => {
        return availableNames.includes(names[index]);
      })
      .forEach((percentale: number[], index: number) => {
        percentale.forEach((percent: number, innerIndex: number) => {
          data.push({
            name: names[index],
            value: percent,
            category: innerIndex === 0 ? 0 : 1,
          });
        });
      });

    console.log(data);

    const options = {
      format: '',
      negative: '',
      positive: '',
      negatives: [0],
      positives: [1],
      colors: {
        0: '#F38B00',
        1: '#0AA5FF',
      },
    };

    /** TODO: Убрать все any, по быстрому не получилось исправить */
    const signs: Map<[number, number], [number, number]> = new Map<
      [number, number],
      [number, number]
    >([
      ...(options.negatives.map((d) => [d, -1]) as any),
      ...(options.positives.map((d) => [d, +1]) as any),
    ]);

    const series = d3
      .stack()
      .keys(
        [].concat(
          options.negatives.slice().reverse() as any,
          options.positives as any,
        ),
      )
      .value(
        ([, value]: any, category: any) =>
          (signs.get(category) as any) * (value.get(category) || 0),
      )
      .offset(d3.stackOffsetDiverging)(
      d3.rollups(
        data,
        (innerData) =>
          d3.rollup(
            innerData,
            ([d]) => d.value,
            (d) => d.category,
          ),
        (d) => d.name,
      ) as any,
    );

    const bias = d3
      .rollups(
        data,
        (v) =>
          d3.sum(
            v,
            (d: any) => d.value * Math.min(0, signs.get(d.category) as any),
          ),
        (d) => d.name,
      )
      .sort(([, a], [, b]) => d3.ascending(a, b));

    const heightMultiplier = 68;
    const height =
      bias.length * heightMultiplier +
      SensitiveAnalysisChart.Margin.top +
      SensitiveAnalysisChart.Margin.bottom;

    const getColor = (key) => {
      return options.colors[key];
    };

    const offset = 50;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(series.flat(2)) as any)
      .rangeRound([
        SensitiveAnalysisChart.Margin.left + offset,
        SensitiveAnalysisChart.Width -
          SensitiveAnalysisChart.Margin.right -
          offset,
      ]);

    const x1Scale = d3
      .scaleLinear()
      .domain([d3.min(sample) || 0, d3.max(sample) || 0])
      .range([
        SensitiveAnalysisChart.Margin.left,
        SensitiveAnalysisChart.Width - SensitiveAnalysisChart.Margin.right,
      ]);

    const y = d3
      .scaleBand()
      .domain(bias.map(([name]) => name))
      .rangeRound([
        SensitiveAnalysisChart.Margin.top,
        height - SensitiveAnalysisChart.Margin.bottom,
      ])
      .padding(53 / heightMultiplier);

    const formatValue = () => {
      const format = d3.format(options.format || '');
      return (innerX) => format(Math.abs(innerX));
    };

    /** Добавление оси X, а так же добавление полосок */
    const xAxis = (g) =>
      g
        .attr('transform', `translate(0,${SensitiveAnalysisChart.Margin.top})`)
        .call(
          d3
            .axisTop(x1Scale)
            .ticks(sample.length)
            .tickFormat(formatValue())
            .tickSizeOuter(0),
        )
        .call((innerG) => innerG.select('.domain').remove())
        .call((innerG) =>
          innerG
            .selectAll('.tick')
            .call((nestedG) => nestedG.selectAll('.tick line').remove())
            .attr('class', 'chart__text chart__text_middle')
            .attr('text-anchor', 'middle')
            .data(sample)
            .append('path')
            .attr('transform', () => `translate(0, -25)`)
            .attr('d', 'M0.5,50.5V454.5')
            .attr('height', SensitiveAnalysisChart.Height)
            .attr('stroke-dasharray', 3)
            .attr('stroke', 'rgba(246, 251, 253, 0.28)'),
        );

    /** Заглушка, показываем в левой части "1,0" + установка "zero point" */
    const yAxis = (g) =>
      g
        /** Установка zero point */
        .attr('transform', `translate(0,0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .call((innerG) =>
          innerG
            .selectAll('.tick')
            .data(bias)
            .attr(
              'transform',
              ([name, min]) =>
                `translate(${x(min) - 5},${
                  (y(name) || 0) + y.bandwidth() - 2
                })`,
            )
            .text('')
            .append('text')
            .attr('class', 'chart__text chart__text_white')
            .attr('fill', 'currentColor')
            .attr('height', '12')
            .attr('text-anchor', 'end')
            .text('1,0'),
        )
        /** Установка позиции zero point */
        .call((innerG) =>
          innerG
            .select('.domain')
            .attr('display', 'none')
            .attr('transform', `translate(${x(0)},0)`),
        );

    /** Заглушка, показываем в правой части "1,0" */
    const y2Axis = (g) =>
      g
        .attr('transform', `translate(0,0)`)
        .call((innerG) =>
          innerG
            .call(d3.axisLeft(y).tickSizeOuter(0))
            .selectAll('.tick')
            .data(bias)
            .attr('transform', ([name, min], index) => {
              const rightBarSeries = series[1];
              const currentTick = rightBarSeries[index][1];
              return `translate(${x(currentTick) + 21},${
                (y(name) || 0) + y.bandwidth() - 2
              })`;
            })
            .text('')
            .append('text')
            .attr('class', 'chart__text chart__text_white')
            .attr('fill', 'currentColor')
            .attr('height', '12')
            .attr('text-anchor', 'end')
            .text('1,0'),
        )
        .call((innerG) => innerG.select('.domain').attr('display', 'none'));

    /** Обозначение слева(названия) */
    const y3Axis = (g) =>
      g
        .attr('transform', `translate(0,0)`)
        .call((innerG) =>
          innerG
            .call(d3.axisLeft(y))
            .call((nestedG) => nestedG.select('.domain').remove())
            .selectAll('.tick')
            .data(bias)
            .attr('class', 'chart__text')
            .attr(
              'transform',
              ([name, min]) =>
                `translate(100, ${(y(name) || 0) + y.bandwidth() - 11 / 2})`,
              // `translate(${x(bias[0][1]) - 20},${
              //   (y(name) || 0) + y.bandwidth() - 11 / 2
              // })`,
            ),
        )
        .call((nestedG) => nestedG.selectAll('.chart__text line').remove())
        .call((nestedG) =>
          nestedG
            .selectAll('.chart__text text')
            .attr('x', '0')
            .attr('text-anchor', 'end'),
        );

    svg
      .append('g')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', (d) => getColor(d.key))
      .selectAll('rect')
      .data((d) => d.map((v) => Object.assign(v, { key: d.key })))
      .join('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', ({ data: [name] }: any) => y(name) || 0)
      .attr('rx', (d) => 2)
      .attr('width', (d) => x(d[1]) - x(d[0]))
      .attr('height', y.bandwidth())
      .append('title');

    svg.append('g').call(xAxis);

    svg.append('g').call(yAxis);
    svg.append('g').call(y2Axis);
    svg.append('g').call(y3Axis);

    console.log(sample, percentiles, names, zeroPoint);
  }, [sample, percentiles, names, zeroPoint, availableNames]);

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
            SensitiveAnalysisChart.Height +
            SensitiveAnalysisChart.Margin.top +
            SensitiveAnalysisChart.Margin.bottom
          }
          ref={d3Container}
        />
      </div>
    </div>
  );
};
