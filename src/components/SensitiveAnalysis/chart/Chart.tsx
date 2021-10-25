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
        SensitiveAnalysisChart.Width + SensitiveAnalysisChart.Margin.right,
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
        .attr('class', 'chart__xAxis')
        .call(
          d3
            .axisTop(x1Scale)
            .ticks(6)
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
            .append('line')
            .attr('transform', () => `translate(0, 20)`)
            .attr('y2', currentPercentiles.length * 66.6)
            .attr('stroke-dasharray', 3)
            .attr('stroke', 'rgba(246, 251, 253, 0.28)'),
        );

    /** Заглушка, показываем в левой части "1,0" + установка "zero point" */
    const yAxis = (g) =>
      g
        /** Установка zero point */
        .attr('transform', `translate(0,0)`)
        .attr('class', 'chart__yAxisLeft')
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
            .text(([, value]) => value),
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
        .attr('class', 'chart__yAxisRight')
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
            .text(([, value], index: number) => {
              const rightBarSeries = series[1];
              const currentTick = rightBarSeries[index][1];
              return currentTick;
            }),
        )
        .call((innerG) => innerG.select('.domain').attr('display', 'none'));

    /** Обозначение слева(названия) */
    const y3Axis = (g) =>
      g
        .attr('transform', `translate(0,0)`)
        .attr('class', 'chart__yAxisLeftName')
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
                `translate(95, ${(y(name) || 0) + y.bandwidth() - 11 / 2})`,
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

    /**
     * У нас отвязана ось X от графика. Но нам нужно, чтоб фиктивная ось X
     * Была связана с графиком, поэтому необходимо двигать X положения баров в графике
     * Для этого мы находим все элементы оси X, парсим, получая значения и позицию
     * После этого, нам необходимо высчитать процент zeroPoint от следующего шага
     * После получения процента, мы множим пред. позицию и выставляем начальную позицию баров
     */
    setTimeout(() => {
      const xAxisResult: { value: number; xPos: number }[] = [];

      document
        .querySelectorAll('.chart__xAxis g')
        .forEach((element: Element) => {
          const xPos = (element.getAttribute('transform') || '')
            .replace('translate(', '')
            .replace(')', '')
            .split(',')[0];

          xAxisResult.push({
            value: Number(element.textContent),
            xPos: Number(xPos),
          });
        });

      const nextFromZeroPoint = xAxisResult.findIndex((innerX) => {
        return innerX.value >= zeroPoint;
      });
      const zeroPointMultiplier = Math.round(
        100 - (zeroPoint / xAxisResult[nextFromZeroPoint].value) * 100,
      );
      const prevFromZeroPointXPos = xAxisResult[nextFromZeroPoint - 1].xPos;
      const zeroPointXPos = prevFromZeroPointXPos * zeroPointMultiplier;
      console.log(zeroPointXPos);
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
      .attr('x', (d) => x(d[0]))
      .attr('y', ({ data: [name] }: any) => y(name) || 0)
      .attr('rx', (d) => 2)
      .attr('width', (d) => x(d[1]) - x(d[0]))
      .attr('height', y.bandwidth())
      .append('title');

    svg.append('g').call(yAxis);
    svg.append('g').call(y2Axis);
    svg.append('g').call(y3Axis);
    svg.append('g').call(xAxis);
  }, [sample, currentPercentiles, names, zeroPoint]);

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
