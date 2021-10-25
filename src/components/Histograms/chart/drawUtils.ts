import * as d3 from 'd3';
import { Bin } from 'd3-array';
import { ScaleLinear } from 'd3-scale';
import { Selection } from 'd3-selection';

export namespace Chart {
  export type Payload = number[] & { x: string; y: string };

  export interface Scale {
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    y1Scale: ScaleLinear<number, number>;
    y2Scale: ScaleLinear<number, number>;
  }

  export interface MainAxis {
    xAxis: (arg: unknown) => unknown;
    yAxis: (arg: unknown) => unknown;
  }

  export interface DummyAxis {
    y1Axis: (arg: unknown) => unknown;
    y2Axis: (arg: unknown) => unknown;
  }

  export interface GetScaleArguments {
    bins: Bin<number, number>[];
    numberOfIterationBin: number[];
  }

  export interface GetMainAxisArguments {
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    payload: Chart.Payload;
  }

  export interface GetDummyAxisArguments {
    y1Scale: ScaleLinear<number, number>;
    y2Scale: ScaleLinear<number, number>;
    payload: Chart.Payload;
    numberOfIterationBin: number[];
  }

  export interface DrawHistogramArguments {
    bins: Bin<number, number>[];
    svg: Selection<null, unknown, null, undefined>;
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
  }

  export interface DrawDotsArguments {
    svg: Selection<null, unknown, null, undefined>;
    percentiles: number[];
    xScale: ScaleLinear<number, number>;
    y1Scale: ScaleLinear<number, number>;
  }

  export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export const Margin: Margin = {
    top: 20,
    right: 50,
    bottom: 35,
    left: 50,
  };
  export const DefaultWidth = 545;
  export const Width = 545;
  export const DefaultHeight = 279;
  export const Height = 279;

  export const getScales = ({
    bins,
    numberOfIterationBin,
  }: GetScaleArguments): Scale => {
    const xScale: ScaleLinear<number, number> = d3
      .scaleLinear()
      .domain([bins[0]?.x0 || 0, bins[bins.length - 1]?.x1 || 0])
      .range([Margin.left, Width - Margin.right]);

    const yScale: ScaleLinear<number, number> = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d: any) => d?.length) as any])
      .nice()
      .range([Height - Margin.bottom, Margin.top]);

    const y1Scale: ScaleLinear<number, number> = d3
      .scaleLinear()
      .domain([0, 1])
      .range([Height - Margin.bottom, Margin.top]);

    const y2Scale: ScaleLinear<number, number> = d3
      .scaleLinear()
      .domain([
        d3.min(numberOfIterationBin) || 0,
        d3.max(numberOfIterationBin) || 0,
      ])
      .range([Height - Margin.bottom, Margin.top]);

    return { xScale, yScale, y1Scale, y2Scale };
  };

  export const getMainAxis = ({
    xScale,
    yScale,
    payload,
  }: GetMainAxisArguments): MainAxis => {
    const xAxis = (g) =>
      g
        .attr('transform', `translate(0,${Height - Margin.bottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(Width / 80)
            .tickSizeOuter(0),
        )
        .selectAll('.tick')
        .attr('class', 'chart__text')
        .call((innerG) =>
          innerG
            .append('text')
            .attr('x', Width - Margin.right)
            .attr('y', -4)
            .text(payload.x),
        );

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${Margin.left},0)`)
        .attr('display', 'none')
        .call(d3.axisLeft(yScale).ticks(Height / 40))
        .call((innerG) => innerG.select('.domain').remove())
        .attr('class', 'chart__text')
        .call((innerG) =>
          innerG
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 4)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .attr('display', 'none')
            .attr('stroke-width', 0)
            .text(''),
        );

    return { xAxis, yAxis };
  };

  export const getDummyAxis = ({
    y1Scale,
    y2Scale,
    payload,
    numberOfIterationBin,
  }: GetDummyAxisArguments): DummyAxis => {
    const y1Axis = (g) =>
      g
        .attr('transform', `translate(${Margin.left - 10},0)`)
        .call(d3.axisLeft(y1Scale).ticks(3))
        .call((innerG) => innerG.select('.domain').remove())
        .attr('class', 'chart__text')
        .call((innerG) => innerG.selectAll('.tick text').attr('x', -12))
        .call((innerG) =>
          innerG
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 4)
            .text(payload.y),
        );

    const y2Axis = (g) =>
      g
        .attr('transform', `translate(${Width - Margin.right},0)`)
        .attr('class', 'grid')
        .call(
          d3
            .axisRight(y2Scale)
            .ticks(numberOfIterationBin.length)
            .tickSize(-(Width - Margin.left - Margin.right)),
        )
        .call((innerG) => innerG.select('.domain').remove())
        .attr('class', 'chart__text')
        /** Line */
        .call((nestedG) => nestedG.selectAll('.tick line'))
        .attr('stroke-dasharray', 3)
        .attr('stroke', 'rgba(246, 251, 253, 0.28)')

        /** Text */
        .call((innerG) =>
          innerG
            .selectAll('.tick text')
            .attr('x', 45)
            .clone()
            .attr('x', 45)
            .text(payload.y),
        )
        .call((nestedG) => nestedG.select('.tick:first-of-type line').remove());

    return { y1Axis, y2Axis };
  };

  export const DrawHistogram = ({
    bins,
    svg,
    xScale,
    yScale,
  }: DrawHistogramArguments): void => {
    svg
      .append('g')
      .attr('fill', 'rgba(86, 185, 242, 1)')
      .selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', (d: Bin<number, number>) => xScale(d.x0 || 0) + 1)
      .attr('width', () => 3)
      .attr('y', (d: Bin<number, number>) => yScale(d.length))
      .attr('height', (d: Bin<number, number>) => yScale(0) - yScale(d.length));
  };

  export const DrawDots = ({
    svg,
    xScale,
    y1Scale,
    percentiles,
  }: DrawDotsArguments): void => {
    const payload = percentiles.map((percentile: number, index: number) => {
      const percentileMap = {
        0: 0.1,
        1: 0.5,
        2: 0.9,
      };

      return {
        x: percentile,
        y: percentileMap[index],
        value: percentile,
      };
    });

    /** Пока точки не отображаем */
    // svg
    //   .append('g')
    //   .attr('stroke', 'var(--color-bg-warning)')
    //   .attr('stroke-width', 1.5)
    //   .attr('fill', 'var(--color-bg-warning)')
    //   .attr('class', 'chart__dot')
    //   .selectAll('circle')
    //   .data(payload)
    //   .join('circle')
    //   .attr('cx', (d: any) => xScale(d.x))
    //   .attr('cy', (d: any) => y1Scale(d.y))
    //   .attr('r', 1.5);

    svg
      .append('g')
      .attr('class', 'chart__dot-text')
      .selectAll('text')
      .data(payload)
      .join('text')
      .attr('class', 'chart__text')
      .attr('dy', '0.35em')
      .attr('x', (d: any) => xScale(d.x) + 34)
      .attr('y', (d: any) => y1Scale(d.y))
      .text((d: any) => String(d.value).split('.')[0]);
  };
}
