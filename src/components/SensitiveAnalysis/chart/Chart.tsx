/* eslint-disable no-param-reassign, newline-per-chained-call */
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { SensitiveAnalysisChart } from '@app/components/SensitiveAnalysis/chart/drawUtils';
import { SensitiveAnalysis } from '@app/interfaces/SensitiveAnalysisInterface';
import * as d3 from 'd3';

import { cnChart } from './cn-chart';

// import { SensitiveAnalysisChart } from './drawUtils';
import './Chart.css';

const PER_ELEMENT_HEIGHT = 66.6;

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
    const result = resultMinMax
      .map((_, index) => percentiles[index])
      .filter((_, index: number) => {
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
    // document.querySelector('#chart').removeChild('*');

    const svg2 = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg2.selectAll('*').remove();

    const data2: SensitiveAnalysisChart.Payload[] = [];

    // const data3: SensitiveAnalysisChart.Payload[] = [
    //   { name: 'F, тыс. м²', value: 21600, category: 1, percentile: 275.134 },
    //   { name: 'F, тыс. м²', value: -15500, category: 0, percentile: 25.653 },
    //   { name: 'H эфф.нн, м', value: 19500, category: 1, percentile: 0.366 },
    //   { name: 'H эфф.нн, м', value: -5000, category: 0, percentile: 0.076 },
    //   {
    //     name: 'Пересч. коэф., д. ед.',
    //     value: 10700,
    //     category: 1,
    //     percentile: 0.155,
    //   },
    //   {
    //     name: 'Пересч. коэф., д. ед.',
    //     value: -3500,
    //     category: 0,
    //     percentile: 0.105,
    //   },
    //   { name: 'Кᴴп, д. ед.', value: 5700, category: 1, percentile: 0.449 },
    //   { name: 'Кᴴп, д. ед.', value: -2400, category: 0, percentile: 0.338 },
    //   { name: 'Плотность, г/см³', value: 2500, category: 1, percentile: 1.421 },
    //   {
    //     name: 'Плотность, г/см³',
    //     value: -1100,
    //     category: 0,
    //     percentile: 1.215,
    //   },
    // ];
    //
    // let cloneResultMinMax = [...resultMinMax];
    //
    // cloneResultMinMax = resultMinMax.filter((result: number[], index: number) =>
    //   availableNames.includes(names[index]),
    // );
    //
    // cloneResultMinMax.forEach((result: number[], index: number) => {
    //   result.forEach((currentResult: number, innerIndex: number) => {
    //     data2.push({
    //       name: availableNames[index],
    //       value: currentResult - zeroPoint,
    //       category: {
    //         color: innerIndex === 0 ? 0 : 1,
    //         direction: currentResult - zeroPoint > 0 ? 'right' : 'left',
    //       },
    //       percentile: currentPercentiles[index]
    //         ? currentPercentiles[index][innerIndex]
    //         : 0,
    //       // color: innerIndex === 0 ? 'orange' : 'blue',
    //       // length: Math.abs(result[innerIndex] - zeroPoint),
    //       // direction: currentResult - zeroPoint > 0 ? 'right' : 'left',
    //     });
    //   });
    // });
    let cloneResultMinMax = [...resultMinMax];

    cloneResultMinMax = resultMinMax.filter((result: number[], index: number) =>
      availableNames.includes(names[index]),
    );

    cloneResultMinMax.forEach((result: number[], index: number) => {
      result.forEach((currentResult: number, innerIndex: number) => {
        data2.push({
          name: availableNames[index],
          value: currentResult - zeroPoint, // сейчас если отриц, то рисует влево
          category: innerIndex === 0 ? 0 : 1,
          percentile: currentPercentiles[index]
            ? currentPercentiles[index][innerIndex]
            : 0,
          // color: innerIndex === 0 ? 'orange' : 'blue',
          // length: Math.abs(result[innerIndex] - zeroPoint),
          // direction: currentResult - zeroPoint > 0 ? 'right' : 'left',
        });
      });
    });
    //
    // data2[data2.length - 2].value = 3.1900450310638515;
    // data2[data2.length - 2].category.direction = 'right';
    // data2[data2.length - 2].category.color = 1;
    //
    // data2[data2.length - 1].value = 5.1900450310638515;
    //
    // console.log(data2);
    //
    // // не трогать
    // const { series, bias, options } = SensitiveAnalysisChart.getAxisData(data2);
    //
    // const getColor = (key) => {
    //   return options.colors[key];
    // };
    //
    // const { xScale, x1Scale, yScale } = SensitiveAnalysisChart.getAxisScale({
    //   series,
    //   resultMinMax: cloneResultMinMax,
    //   bias,
    // });
    //
    // const { xAxis, yAxis, y2Axis, y3Axis } = SensitiveAnalysisChart.getAxis({
    //   xScale,
    //   x1Scale,
    //   yScale,
    //   options,
    //   resultMinMax: cloneResultMinMax,
    //   currentPercentiles,
    //   bias,
    //   series,
    //   data: data2,
    // });
    //
    // // console.dir(xScale.name);
    // console.log('series: ', xAxis, yAxis, y2Axis, y3Axis, getColor);

    function tornadoChart() {
      // const margin = { top: 20, right: 30, bottom: 40, left: 100 };
      // const width = 800 - margin.left - margin.right;
      // const height = 400 - margin.top - margin.bottom;
      const x = d3.scaleLinear().range([0, SensitiveAnalysisChart.Width]);
      // const y = d3.scaleBand().rangeRound([0, height], 0.1);
      const y = d3.scaleBand().rangeRound([0, SensitiveAnalysisChart.Height]);
      // const xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(10);
      const xAxis2 = d3.axisBottom(x).ticks(10);
      const yAxis2 = d3.axisLeft(y).tickSize(0);

      const getColor = (key) => {
        return SensitiveAnalysisChart.options.colors[key];
      };

      svg2
        .attr(
          'width',
          SensitiveAnalysisChart.Width +
            SensitiveAnalysisChart.Margin.left +
            SensitiveAnalysisChart.Margin.right,
        )
        .attr(
          'height',
          currentHeight +
            SensitiveAnalysisChart.Margin.top +
            SensitiveAnalysisChart.Margin.bottom,
        )
        .append('g')
        .attr(
          'transform',
          `translate(${SensitiveAnalysisChart.Margin.left},${SensitiveAnalysisChart.Margin.right})`,
        );
      let maxvalue;

      // svg2.selectAll('*').remove();

      function chart(selection) {
        selection.each((data) => {
          maxvalue =
            Math.abs(
              d3.extent(data, (d: any) => {
                return d.value;
              })[0] as any,
            ) >
            Math.abs(
              d3.extent(data, (d: any) => {
                return d.value;
              })[1] as any,
            )
              ? Math.abs(
                  d3.extent(data, (d: any) => {
                    return d.value;
                  })[0] as any,
                )
              : Math.abs(
                  d3.extent(data, (d: any) => {
                    return d.value;
                  })[1] as any,
                );
          x.domain([maxvalue * -1, maxvalue]);
          y.domain(
            data.map((d) => {
              return d.name;
            }),
          );
          const minValue =
            // eslint-disable-next-line prefer-spread
            Math.max.apply(
              Math,
              data.map((o) => {
                return o.value;
              }),
            ) * -1;

          yAxis2.tickPadding(Math.abs(x(minValue) - x(0)) + 10);
          const bar = svg2.selectAll('.bar').data(data);

          bar
            .enter()
            .append('rect')
            .attr('class', (d: any) => {
              return `bar bar--${d.value < 0 ? 'negative' : 'positive'}`;
            })
            .attr('x', (d: any) => {
              return x(Math.min(0, d.value));
            })
            .attr('y', (d: any) => {
              return y(d.name) as any;
            })
            .attr('rx', () => 2)
            .attr('width', (d: any) => {
              return Math.abs(x(d.value) - x(0));
            })
            .attr('id', (d: any) => {
              return d.name;
            })
            .attr('style', (d: any) => {
              return `fill: ${getColor(d.category)}`; // TODO d.category == null
            })
            .attr('height', y.bandwidth());
          bar
            .enter()
            .append('text')
            .attr('text-anchor', 'end')
            .attr('x', (d: any, i) => {
              let titlePlacement =
                Math.abs(x(d.value) - x(0)) + x(Math.min(0, d.value)) - 5;

              if (Math.abs(x(d.value) - x(0)) < 30 && d.value > 0)
                titlePlacement += 30;
              else if (d.value < 0) {
                // Negative placement
                titlePlacement = x(Math.min(0, d.value)) - 5;
              }

              return titlePlacement;
            })
            .attr('y', (d: any, i) => {
              return (y(d.name) as any) + y.bandwidth() / 2;
            })
            .attr('dy', '.35em')
            .text((d: any) => {
              return d.percentile.toFixed(3); // персентали слева
            });
          svg2
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${SensitiveAnalysisChart.Height})`)
            .call(xAxis2);
          svg2
            .append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${x(0)},0)`)
            .call(yAxis2);
        });
      }

      return chart;
    }

    const chart = tornadoChart();

    d3.select(d3Container.current).datum(data2).call(chart);

    // svg
    //   .append('g')
    //   .attr('class', 'chart__main')
    //   .selectAll('g')
    //   .data(series)
    //   .join('g')
    //   .attr('fill', (d) => getColor(d.key))
    //   .selectAll('rect')
    //   .data((d) => d)
    //   .data((d) => {
    //     console.log(d);
    //
    //     return d.map((v) => Object.assign(v, { key: d.key }));
    //   })
    //   // бары
    //   .join('rect')
    //   .attr('class', 'chart__bar')
    //   // смещение баров по x и y относительно svg
    //   .attr('x', (d) => xScale(d[0]))
    //   .attr('y', ({ data: [name] }: any) => yScale(name) || 0)
    //   .attr('rx', () => 2)
    //   .attr('width', (d) => {
    //     // console.log(xScale(d[1]) - xScale(d[0]));
    //
    //     return xScale(d[1]) - xScale(d[0]);
    //   })
    //   .attr('height', yScale.bandwidth());
    // svg.append('g').call(yAxis);
    // svg.append('g').call(y2Axis);
    // svg.append('g').call(y3Axis);
    // svg.append('g').call(xAxis);
    console.log(
      resultMinMax,
      currentPercentiles,
      names,
      availableNames,
      zeroPoint,
    );
  }, [
    resultMinMax,
    currentPercentiles,
    names,
    availableNames,
    zeroPoint,
    currentHeight,
  ]);

  useEffect(() => {
    // if (d3Container.current) {
    draw();
    // }
  }, [draw, availableNames]);

  return (
    <div className="chart">
      <div className={cnChart()}>
        <svg ref={d3Container} />
      </div>
    </div>
  );
};
