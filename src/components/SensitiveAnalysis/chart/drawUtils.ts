import * as d3 from 'd3';
/* eslint-disable newline-per-chained-call */

export namespace DrawUtils {
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
    left: 160,
  };

  export const Width = 651 - Margin.right - Margin.left;
  export const Height = 400 - Margin.top - Margin.bottom;

  export interface Payload {
    name: string;
    value: number;
    category: 0 | 1;
    percentile: number;
  }

  export interface Options {
    format: string;
    colors: Record<number, string>;
  }

  export const options: Options = {
    format: '',
    colors: {
      0: '#F38B00',
      1: '#0AA5FF',
    },
  };

  const formatValue = () => {
    const format = d3.format(options.format || '');

    return (innerX) => format(Math.abs(innerX));
  };

  const getColor = (key) => {
    return options.colors[key];
  };

  export function tornadoChart(
    currentData,
    zeroPoint,
    resultMinMax: number[][],
    svg,
    availableNames: string[],
    currentHeight: number,
  ) {
    const heightMultiplier = 68;

    const height =
      availableNames.length * heightMultiplier + Margin.top + Margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(currentData, (d: any) => d.value) as any])
      .range([Margin.left, Width]);

    const x1 = d3
      .scaleLinear()
      .domain([0, zeroPoint.toFixed() * 2])
      .range([Margin.left, Width]);

    const x2 = d3
      .scaleLinear()
      .domain([zeroPoint.toFixed(), zeroPoint.toFixed()])
      .range([Margin.left, Width]);

    const y = d3
      .scaleBand()
      .domain(currentData.map(({ name }) => name))
      .rangeRound([Margin.top, height - Margin.bottom])
      .padding(53 / heightMultiplier);

    const xAxisMiddleZeroPoint = (g) => {
      return g
        .attr('transform', `translate(0,${Margin.top})`)
        .attr('class', 'chart__xAxis')
        .call(
          d3
            .axisTop(x2)
            .scale(x2)
            .ticks(1)
            .tickFormat(formatValue())
            .tickSizeOuter(0),
        )
        .call((innerG) => innerG.select('.domain').remove())
        .call((innerG) =>
          innerG
            .selectAll('.tick')
            .call((nestedG) => nestedG.selectAll('.tick line').remove())
            .call((nestedG) => nestedG.selectAll('.tick text').remove())
            /** цифры сверху */
            .call((nestedG) =>
              nestedG
                .append('text')
                .attr('style', 'font-weight: bold')
                .attr(
                  'class',
                  'chart__text chart__text_middle chart__text_white',
                )
                .attr('text-anchor', 'middle')
                .text((t: number) => t),
            )
            /** пунктирные линии */
            .append('line')
            .attr('transform', 'translate(0, 20)')
            .attr('y2', availableNames.length * 66.6)
            .attr('stroke', 'rgba(255, 255, 255, .28)'),
        );
    };

    const xAxis = (g) => {
      return g
        .attr('transform', `translate(0,${Margin.top})`)
        .attr('class', 'chart__xAxis')
        .call(
          d3
            .axisTop(x1)
            .scale(x1)
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
            /** цифры сверху */
            .call((nestedG) =>
              nestedG
                .append('text')
                .attr('class', 'chart__text chart__text_middle')
                .attr('text-anchor', 'middle')
                .text((t: number) => t),
            )
            /** пунктирные линии */
            .append('line')
            .attr('transform', 'translate(0, 20)')
            .attr('y2', availableNames.length * 66.6)
            .attr('stroke-dasharray', 3)
            .attr('stroke', 'rgba(246, 251, 253, 0.28)'),
        );
    };

    /** Названия слева */
    const yAxis = (g) => {
      return g
        .attr('transform', `translate(0, -14)`)
        .call((innerG) =>
          innerG
            .attr('class', 'chart__text chart__text_start chart__yAxisLeftName')
            .attr('data-testid', 'chart-names-container')
            .call(d3.axisLeft(y))
            .call((nestedG) => nestedG.select('.domain').remove())
            .selectAll('.tick')
            .selectAll('line')
            .remove()
            .data(currentData[0]),
        )
        .call((nestedG) => nestedG.selectAll('.chart__text line').remove())
        .call((nestedG) =>
          nestedG
            .selectAll('.chart__text text')
            .attr('x', '0')
            .attr('text-anchor', 'end'),
        );
    };

    svg
      .attr('width', Width + Margin.left + Margin.right)
      .attr('height', currentHeight + Margin.top + Margin.bottom);

    svg.append('g').call(yAxis);
    svg.append('g').call(xAxis);
    svg.append('g').call(xAxisMiddleZeroPoint);

    let maxvalue;

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

        const bar = svg
          .append('g')
          .attr('data-testid', 'chart-bars-container')
          .selectAll('.bar')
          .data(data);

        bar
          .enter()
          .append('rect')
          .attr('class', (d) => {
            return `bar bar--${d.value < 0 ? 'negative' : 'positive'}`;
          })
          .attr('x', (d) => {
            return x(Math.min(0, d.value));
          })
          .attr('y', (d) => {
            return y(d.name);
          })
          .attr('rx', () => 2)
          .attr('width', (d) => {
            return Math.abs(x(d.value) - x(0));
          })
          .attr('data-testid', (d) => {
            return d.name;
          })
          .attr('style', (d) => {
            return `fill: ${getColor(d.category)}`;
          })
          .attr('height', y.bandwidth());
        bar
          .enter()
          .append('text')
          .attr(
            'class',
            (d) =>
              `chart__text chart__text_white ${
                d.value > 0 && 'chart__text_start'
              }`,
          )
          .attr('text-anchor', 'end')
          /** Цифры на барах */
          .attr('x', (d) => {
            let titlePlacementX = 0;

            if (d.value >= 0) {
              titlePlacementX =
                Math.abs(x(d.value) - x(0)) + x(Math.min(0, d.value)) + 5;
            } else {
              titlePlacementX = x(Math.min(0, d.value)) - 5;
            }

            return titlePlacementX;
          })
          .attr('data-testid', (d) => {
            return d.name;
          })
          .attr('y', (d) => {
            return (y(d.name) as any) + y.bandwidth() / 2;
          })
          .attr('dy', (d, index) => {
            let baseTitlePlacementY = '.35em';

            const prev = data[index - 1];
            const next = data[index + 1];

            if (
              prev &&
              d.name === prev.name &&
              ((d.value > 0 && prev.value > 0) ||
                (d.value < 0 && prev.value < 0))
            ) {
              baseTitlePlacementY = '24px';
            } else if (
              next &&
              d.name === next.name &&
              ((d.value > 0 && next.value > 0) ||
                (d.value < 0 && next.value < 0))
            ) {
              baseTitlePlacementY = '-12px';
            }

            return baseTitlePlacementY;
          })
          .text((d) => {
            return d.percentile.toFixed(3);
          });
      });
    }

    return chart;
  }
}
