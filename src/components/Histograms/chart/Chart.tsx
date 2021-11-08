import React, { useCallback, useEffect, useRef } from 'react';
import { Histogram } from '@app/generated/graphql';
import { DrawHelper } from '@app/utils/DrawHelper';
import * as d3 from 'd3';
import { Bin } from 'd3-array';

import { cnChart } from './cn-chart';
import { Chart } from './drawUtils';

import './Chart.scss';

const ChartComponent: React.FC<Histogram & { numberOfRows: number }> = ({
  title,
  subtitle,
  percentiles,
  sample,
  numberOfIterationBin,
  numberOfRows,
  cdf,
}) => {
  const d3Container = useRef(null);

  const draw = useCallback(() => {
    const svg = d3.select(d3Container.current);

    /** Чистим все, для перерисовки графиков */
    svg.selectAll('*').remove();

    /** Для создания чартов необходимо добавить в массив объект(это же js, комон) */
    const payload: Chart.Payload = Object.assign(sample, { x: '', y: '' });

    /** Создание бинов, это "бары", которые будут отображаться на графике */
    const bins: Bin<number, number>[] = d3.bin().thresholds(numberOfRows)(
      payload,
    );

    /** Получаем основные данные и их распределение на гистограмме */
    const { xScale, yScale, y1Scale, y2Scale } = Chart.getScales({
      bins,
      numberOfIterationBin,
    });

    /** Получаем основные оси, на основе них будет сопастовление с данными выше */
    const { xAxis, yAxis } = Chart.getMainAxis({ xScale, yScale, payload });

    /** Получаем дополнительные(фейковые) оси, которые не привязанны к данным */
    const { y1Axis, y2Axis } = Chart.getDummyAxis({
      y1Scale,
      y2Scale,
      payload,
      numberOfIterationBin,
    });

    const pdf = Chart.getPayload(cdf, sample);

    const probabilityDensityXScale = DrawHelper.getScale(
      DrawHelper.getDomain(pdf, DrawHelper.getX),
      DrawHelper.xScalePosition({
        left: Chart.Margin.left,
        right: Chart.Margin.right,
        width: Chart.Width,
      }),
    );

    const probabilityDensityYScale = DrawHelper.getScale(
      DrawHelper.getDomain(pdf, DrawHelper.getY),
      DrawHelper.yScalePosition({
        top: Chart.Margin.top,
        bottom: Chart.Margin.bottom,
        height: Chart.Height,
      }),
    );

    const area = d3
      .area<DrawHelper.Point>()
      .x((d) => probabilityDensityXScale(DrawHelper.getX(d)) as number)
      .y0(Chart.Height)
      .y1((d) => probabilityDensityYScale(DrawHelper.getY(d)) as number);

    const graphArea = svg.append('g');
    const defs = svg.append('defs');

    const bgGradient = defs
      .append('linearGradient')
      .attr('id', `main-content-bg-gradient`)
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
      .attr('id', `main-content-clip-line-path`)
      .append('path')
      .attr('d', area(pdf) as string)
      .attr('class', 'value-line');

    const clipPath = graphArea
      .append('g')
      .attr('clip-path', `url(#main-content-clip-line-path)`);

    clipPath
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', Chart.Width)
      .attr('height', Chart.Height)
      .style('fill', 'url(#main-content-bg-gradient)');

    graphArea
      .append('path')
      .attr('class', 'pdfLine')
      .datum(pdf)
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

    /** Рисуем график на основе данных */
    Chart.DrawHistogram({ bins, svg, xScale, yScale });

    /** Рисуем точки на основе данных */
    Chart.DrawDots({ svg, xScale, y1Scale, percentiles });

    /** Добавляем все оси на гистограмму */
    svg.append('g').call(xAxis);

    svg.append('g').call(yAxis);

    svg.append('g').call(y1Axis);

    svg.append('g').call(y2Axis);
  }, [sample, percentiles, numberOfIterationBin, numberOfRows, cdf]);

  useEffect(() => {
    if (d3Container.current) {
      draw();
    }
  }, [draw, sample]);

  return (
    <div className="chart">
      <div className="chart__description">
        <div>{title}</div>
        <div>{subtitle}</div>
      </div>

      <div className={cnChart()}>
        <svg
          width={Chart.DefaultWidth}
          height={Chart.DefaultHeight}
          ref={d3Container}
        />
      </div>
    </div>
  );
};

export default ChartComponent;
