import * as d3 from 'd3';

export namespace SensitiveAnalysisChart {
  export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export const Margin: Margin = {
    top: 36,
    right: 0,
    bottom: 0,
    left: 110,
  };

  export const Width = 651 - Margin.right - Margin.left;
  export const Height = 400 - Margin.top - Margin.bottom;

  export interface Payload {
    name: string;
    value: number;
    category: number;
    percentile: number;
  }

  export interface Options {
    format: string;
    negative: string;
    positive: string;
    negatives: number[];
    positives: number[];
    colors: Record<number, string>;
  }

  export type Series = d3.Series<{ [key: string]: number }, string>[];
  export type Bias = [string, number];

  export function getAxisData(data: SensitiveAnalysisChart.Payload[]): {
    series: Series;
    bias: Bias[];
    options: Options;
  } {
    const options: Options = {
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

    const mappedNegatives = options.negatives.map((d: number) => [d, -1]);
    const mappedPositives = options.positives.map((d: number) => [d, +1]);

    /** TODO: Убрать все any, по быстрому не получилось исправить */
    const signs = new Map<number[][], number[][]>([
      ...(mappedNegatives as any),
      ...(mappedPositives as any),
    ]);

    const series: Series = d3
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

    const bias = d3.rollups(
      data,
      (v) =>
        d3.sum(
          v,
          (d: any) => d.value * Math.min(0, signs.get(d.category) as any),
        ),
      (d) => d.name,
    );

    return { series, bias, options };
  }

  export function getAxisScale({
    series,
    resultMinMax,
    bias,
  }: {
    series: SensitiveAnalysisChart.Series;
    resultMinMax: number[][];
    bias: SensitiveAnalysisChart.Bias[];
  }): {
    xScale: d3.ScaleLinear<number, number, never>;
    x1Scale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleBand<string>;
  } {
    const offset = 50;
    const sample = resultMinMax.flat(1);

    const xScale = d3
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

    const heightMultiplier = 68;
    const height =
      bias.length * heightMultiplier +
      SensitiveAnalysisChart.Margin.top +
      SensitiveAnalysisChart.Margin.bottom;

    const yScale = d3
      .scaleBand()
      .domain(bias.map(([name]: any) => name))
      .rangeRound([
        SensitiveAnalysisChart.Margin.top,
        height - SensitiveAnalysisChart.Margin.bottom,
      ])
      .padding(53 / heightMultiplier);

    return { xScale, x1Scale, yScale };
  }

  export function getAxis({
    xScale,
    x1Scale,
    yScale,
    options,
    currentPercentiles,
    bias,
    series,
    data,
  }: {
    xScale: d3.ScaleLinear<number, number, never>;
    x1Scale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleBand<string>;
    options: Options;
    resultMinMax: number[][];
    currentPercentiles: number[][];
    bias: Bias[];
    series: Series;
    zeroPoint: number;
    data: SensitiveAnalysisChart.Payload[];
  }): {
    xAxis;
    yAxis;
    y2Axis;
    y3Axis;
  } {
    const formatValue = () => {
      const format = d3.format(options.format || '');

      return (innerX) => format(Math.abs(innerX));
    };

    const getPercentileByName = (name: string, isPositive = false): string => {
      const currentElement = data.filter(
        (currentData) => currentData.name === name,
      );

      return currentElement[isPositive ? 1 : 0].percentile
        .toFixed(3)
        .toString();
    };

    const getPositiveTickByNegativeValue = (negativeValue: number): number => {
      const findPositiveIndexByNegative = () => {
        const negativeSeries = series[0];

        const index = negativeSeries.findIndex((innerSeries: any[]) => {
          return innerSeries[0] === negativeValue;
        });

        return index;
      };

      const rightBarSeries = series[1];
      const currentTick = rightBarSeries[findPositiveIndexByNegative()][1];

      return currentTick;
    };

    /** Добавление оси X, а так же добавление полосок */
    const xAxis = (g) =>
      g
        .attr('transform', `translate(4,${SensitiveAnalysisChart.Margin.top})`)
        .attr('class', 'chart__xAxis')
        .call(
          d3
            .axisTop(x1Scale)
            .ticks(3)
            .tickFormat(formatValue())
            .tickSizeOuter(0),
        )
        .call((innerG) => innerG.select('.domain').remove())
        .call((innerG) =>
          innerG
            .selectAll('.tick')
            .call((nestedG) => nestedG.selectAll('.tick line').remove())
            .call((nestedG) => nestedG.selectAll('.tick text').remove())
            .call((nestedG) =>
              nestedG
                .append('text')
                .attr('class', 'chart__text chart__text_middle')
                .attr('text-anchor', 'middle')
                .text((x: number) => x),
            )
            // .data(resultMinMax.flat(1))
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
        .call(d3.axisLeft(yScale).tickSizeOuter(0))
        .call((innerG) =>
          innerG
            .selectAll('.tick')
            .data(bias)
            .attr(
              'transform',
              ([name, min]) =>
                `translate(${xScale(min) - 5},${
                  (yScale(name) || 0) + yScale.bandwidth() + 13
                })`,
            )
            .text('')
            .append('text')
            .attr('class', 'chart__text chart__text_white')
            .text(([name]) => getPercentileByName(name)),
        )
        /** Установка позиции zero point */
        .call((innerG) =>
          innerG
            .select('.domain')
            .attr('display', 'none')
            .attr('transform', `translate(${xScale(0)},0)`),
        );

    /** Заглушка, показываем в правой части "1,0" */
    const y2Axis = (g) =>
      g
        .attr('transform', `translate(0,0)`)
        .attr('class', 'chart__yAxisRight')
        .call((innerG) =>
          innerG
            .call(d3.axisLeft(yScale).tickSizeOuter(0))
            .selectAll('.tick')
            .data(bias)
            .attr('transform', ([name, min]) => {
              return `translate(${
                xScale(getPositiveTickByNegativeValue(min)) + 5
              },${(yScale(name) || 0) + yScale.bandwidth() + 13})`;
            })
            .text('')
            .append('text')
            .attr('class', 'chart__text chart__text_start chart__text_white')
            .text(([name]) => {
              return getPercentileByName(name, true);
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
            .call(d3.axisLeft(yScale))
            .call((nestedG) => nestedG.select('.domain').remove())
            .selectAll('.tick')
            .data(bias)
            .attr('class', 'chart__text chart__text_start')
            .attr(
              'transform',
              ([name]) =>
                `translate(0, ${(yScale(name) || 0) + yScale.bandwidth() / 2})`,
            ),
        )
        .call((nestedG) => nestedG.selectAll('.chart__text line').remove())
        .call((nestedG) =>
          nestedG
            .selectAll('.chart__text text')
            .attr('x', '0')
            .attr('text-anchor', 'end'),
        );

    return {
      xAxis,
      yAxis,
      y2Axis,
      y3Axis,
    };
  }
}
