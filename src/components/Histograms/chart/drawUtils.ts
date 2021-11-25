import { DrawHelper } from '@app/utils/DrawHelper';
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
    probabilityDensityXScale: ScaleLinear<number, number, never>;
    probabilityDensityYScale: ScaleLinear<number, number, never>;
    cumulativeXScale: ScaleLinear<number, number, never>;
    cumulativeYScale: ScaleLinear<number, number, never>;
    preparedPercentiles: DrawHelper.Point[];
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
    cdf: DrawHelper.Point[];
    percentiles: number[];
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
  }

  export interface DrawHistogramArguments {
    bins: Bin<number, number>[];
    svg: Selection<null, unknown, null, undefined>;
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
  }

  export interface DrawDotsArguments {
    svg: Selection<null, unknown, null, undefined>;
    percentiles: DrawHelper.Point[];
    xScale: ScaleLinear<number, number>;
    y1Scale: ScaleLinear<number, number>;
  }

  export interface DrawCdfLineWithGradientArguments {
    svg: Selection<null, unknown, null, undefined>;
    cdf: DrawHelper.Point[];
    probabilityDensityXScale: ScaleLinear<number, number, never>;
    probabilityDensityYScale: ScaleLinear<number, number, never>;
    id: string;
  }

  export interface DrawCdfLineWithGridArguments {
    svg: Selection<null, unknown, null, undefined>;
    cdf: DrawHelper.Point[];
    percentiles: DrawHelper.Point[];
    cumulativeXScale: ScaleLinear<number, number, never>;
    probabilityDensityXScale: ScaleLinear<number, number, never>;
    xScale: ScaleLinear<number, number>;
    sample: number[];
    cumulativeYScale: ScaleLinear<number, number, never>;
    id: string;
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
  export const DefaultY2TickCount = 5;

  type D3Selection = d3.Selection<null, unknown, null, undefined>;
  type D3ScaleLinear = d3.ScaleLinear<number, number>;

  export const getScales = ({
    bins,
    numberOfIterationBin,
    cdf,
    percentiles,
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

    const step = Math.round(numberOfIterationBin.length / 5);
    const normalizedBin: number[] = Array(5)
      .fill(1)
      .map((_, index) => {
        const currentBin = numberOfIterationBin[index * step];
        return currentBin <= 1000 ? 1000 : Math.round(currentBin / 1000) * 1000;
      });

    const y2Scale: ScaleLinear<number, number> = d3
      .scaleLinear()
      .domain([d3.min(normalizedBin) || 0, d3.max(normalizedBin) || 0])
      .range([Height - Margin.bottom, Margin.top]);

    const probabilityDensityXScale = DrawHelper.getScale(
      DrawHelper.getDomain(cdf, DrawHelper.getX),
      DrawHelper.xScalePosition({
        left: Chart.Margin.left,
        right: Chart.Margin.right,
        width: Chart.Width,
      }),
    );

    const probabilityDensityYScale = DrawHelper.getScale(
      DrawHelper.getDomain(cdf, DrawHelper.getY),
      DrawHelper.yScalePosition({
        top: Chart.Margin.top,
        bottom: Chart.Margin.bottom,
        height: Chart.Height,
      }),
    );

    const cumulativeXScale = DrawHelper.getScale(
      DrawHelper.getDomain(cdf, DrawHelper.getX),
      DrawHelper.xScalePosition({
        left: Chart.Margin.left,
        right: Chart.Margin.right,
        width: Chart.Width,
      }),
    );
    const cumulativeYScale = DrawHelper.getScale(
      DrawHelper.getDomain(cdf, DrawHelper.getY),
      DrawHelper.yScalePosition({
        top: Chart.Margin.top,
        bottom: Chart.Margin.bottom,
        height: Chart.Height,
      }),
    );

    const preparedPercentiles: DrawHelper.Point[] = percentiles.map(
      (percentile: number, index: number) => {
        const percentileMap = {
          0: 0.1,
          1: 0.5,
          2: 0.9,
        };

        return {
          x: percentile,
          y: percentileMap[index],
        };
      },
    );

    return {
      xScale,
      yScale,
      y1Scale,
      y2Scale,
      probabilityDensityXScale,
      probabilityDensityYScale,
      cumulativeXScale,
      cumulativeYScale,
      preparedPercentiles,
    };
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
            .tickFormat((x) => `${Number(x).toFixed(0)}`)
            .ticks(3)
            .tickPadding(5)
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
            .ticks(DefaultY2TickCount)
            .tickSize(-(Width - Margin.left - Margin.right))
            .tickFormat((x) => `${Number(x).toFixed(0)}`),
        )
        .call((innerG) => innerG.select('.domain').remove())
        .attr('class', 'chart__text chart__grid')
        /** Text */
        .call((innerG) =>
          innerG
            .selectAll('.tick text')
            .attr('y', -10)
            .attr('x', 50)
            .clone()
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
      .attr('fill', 'rgba(86, 185, 242, 0.5)')
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
      .data(percentiles)
      .join('text')
      .attr('dy', '0.35em')
      .attr('x', (d: any) => xScale(d.x))
      .attr('y', (d: any) => y1Scale(d.y))
      .text((d: any) => String(d.x).split('.')[0]);
  };

  export const getPayload = (
    cdf: number[],
    sample: number[],
  ): DrawHelper.Point[] => {
    const maxSample = d3.max(sample) || 0;
    const stepPerSample = maxSample / cdf.length;

    return cdf.map((currentCdf: number, index) => ({
      x: index * stepPerSample,
      y: currentCdf,
    }));
  };

  export const DrawCdfLineWithGradient = ({
    probabilityDensityXScale,
    probabilityDensityYScale,
    svg,
    cdf,
    id,
  }: DrawCdfLineWithGradientArguments): void => {
    const area = d3
      .area<DrawHelper.Point>()
      .x((d) => probabilityDensityXScale(DrawHelper.getX(d)) as number)
      .y0(Chart.Height)
      .y1((d) => probabilityDensityYScale(DrawHelper.getY(d)) as number);

    const graphArea = svg.append('g');
    const defs = svg.append('defs');

    const bgGradient = defs
      .append('linearGradient')
      .attr('id', `main-content-bg-gradient_${id}`)
      .attr('gradientTransform', 'rotate(90)');

    bgGradient
      .append('stop')
      .attr('stop-color', 'rgba(41, 176, 255, 0.4)')
      .attr('offset', '0%');
    bgGradient
      .append('stop')
      .attr('stop-color', 'rgba(64,112,140,0)')
      .attr('offset', '100%');

    defs
      .append('clipPath')
      .attr('id', `main-content-clip-line-path_${id}`)
      .append('path')
      .attr('d', area(cdf) as string)
      .attr('class', 'value-line');

    const clipPath = graphArea
      .append('g')
      .attr('clip-path', `url(#main-content-clip-line-path_${id})`);

    clipPath
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', Chart.Width)
      .attr('height', Chart.Height)
      .style('fill', `url(#main-content-bg-gradient_${id})`);

    graphArea
      .append('path')
      .attr('class', 'pdfLine')
      .datum(cdf)
      .attr('fill', 'none')
      .attr('stroke', '#0AA5FF')
      .call((g) =>
        g
          .selectAll('.tick:not(:first-of-type) line')
          .attr('stroke-opacity', 0.5)
          .attr('stroke-dasharray', '2,2'),
      )
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line<DrawHelper.Point>()
          .x((d) => probabilityDensityXScale(DrawHelper.getX(d)) as number)
          .y((d) => probabilityDensityYScale(DrawHelper.getY(d)) as number),
      );
  };

  export const drawTicksX = (svg: D3Selection, scale: D3ScaleLinear): void => {
    svg.append('g').call((g) =>
      g
        .attr('transform', `translate(0,${Height - Margin.bottom})`)
        .attr('class', 'chart__axis_bottom')
        .call(
          d3
            .axisBottom(scale)
            .ticks(Width / 80)
            .tickSize(5)
            .tickFormat(() => ''),
        ),
    );
    svg.append('g').call((g) =>
      g
        .attr('transform', `translate(0,${Height - Margin.bottom})`)
        .attr('class', 'chart__grid')
        .call(d3.axisBottom(scale).ticks(5).tickSize(-Height)),
    );
  };

  export const drawTicksY = (svg: D3Selection, scale: D3ScaleLinear): void => {
    svg.append('g').call((g) =>
      g
        .attr('transform', `translate(${Margin.left},0)`)
        .attr('class', 'chart__axis chart__axis_left')
        .call(
          d3
            .axisLeft(scale)
            .ticks(Width / 80)
            .tickSize(5)
            .tickFormat(
              (domainValue) => domainValue.toString(),
              // (domainValue) => `${roundTo(3, domainValue as number)}`,
            ),
        ),
    );
  };

  export const DrawCdfLineWithGrid = ({
    cumulativeXScale,
    probabilityDensityXScale,
    xScale,
    cumulativeYScale,
    svg,
    cdf,
    id,
    sample,
    percentiles,
  }: DrawCdfLineWithGridArguments): void => {
    const projectionLinesFromPoint = (
      point: DrawHelper.Point,
      data: DrawHelper.Point[],
    ) => {
      svg
        .append('path')
        .datum([
          { x: d3.min(sample), y: point.y },
          point,
          { x: point.x, y: d3.min(data, DrawHelper.getY) },
        ])
        .attr('class', 'chart__projection-lines')
        .attr(
          'd',
          d3
            .line<any>()
            .x((d) => xScale(DrawHelper.getX(d)) as number)
            .y((d) => cumulativeYScale(DrawHelper.getY(d)) as number),
        );
    };

    drawTicksY(svg, cumulativeYScale);

    if (percentiles.length) {
      svg
        .selectAll('points')
        .data(percentiles)
        .enter()
        .append('text')
        .text((d) => DrawHelper.getX(d).toFixed(0))
        .attr('class', 'chart__dot-text')
        .attr('x', (d) => xScale(DrawHelper.getX(d)) as number)
        .attr('y', (d) => cumulativeYScale(DrawHelper.getY(d)) as number)
        .attr('transform', `translate(5, 0)`);

      percentiles.forEach((percentile) => {
        projectionLinesFromPoint(percentile, cdf);
      });
    }

    const graphArea = svg.append('g');

    graphArea
      .append('path')
      .attr('class', 'sfLine')
      .datum(cdf)
      .attr('fill', 'none')
      .attr('stroke', '#F38B00')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line<DrawHelper.Point>()
          .x((d) => cumulativeXScale(DrawHelper.getX(d)) as number)
          .y((d) => cumulativeYScale(DrawHelper.getY(d)) as number),
      );
  };
}
