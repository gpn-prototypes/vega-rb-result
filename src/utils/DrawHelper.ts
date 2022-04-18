import * as d3 from 'd3';
/* eslint-disable newline-per-chained-call */

export namespace DrawHelper {
  export interface Point {
    x: number;
    y: number;
    title?: string;
  }

  export const xScalePosition = ({ left, right, width }) => [
    left,
    width - right,
  ];
  export const yScalePosition = ({ height, bottom, top }) => [
    height - bottom,
    top,
  ];

  /** Получение оси X */
  export const getX = (d: Point): number => d.x;

  /** Получение оси Y */
  export const getY = (d: Point): number => d.y;

  /** Получаем скалирование */
  export const getScale = (
    domain: number[] | { valueOf(): number }[],
    position: number[],
  ): d3.ScaleLinear<number, number> =>
    // eslint-disable-next-line prettier/prettier
    d3.scaleLinear().domain(domain).nice().range(position);

  /** Домен */
  export const getDomain = (
    points: Point[],
    func: (d: Point) => number,
  ): number[] => [
    d3.min(points, func) as number,
    d3.max(points, func) as number,
  ];

  /** расположение цифр на барах по X */
  export const getTitlePlacementX = (d, xScale) => {
    let titlePlacementX = 0;

    if (d.value >= 0) {
      titlePlacementX =
        Math.abs(xScale(d.value) - xScale(0)) +
        xScale(Math.min(0, d.value)) +
        5;
    } else {
      titlePlacementX = xScale(Math.min(0, d.value)) - 5;
    }

    return titlePlacementX;
  };

  /** расположение цифр на барах по Y */
  export const getTitlePlacementY = (d, index: number, data) => {
    let baseTitlePlacementY = '.35em';

    const prev = data[index - 1];
    const next = data[index + 1];

    if (
      prev &&
      d.name === prev.name &&
      ((d.value > 0 && prev.value > 0) || (d.value < 0 && prev.value < 0))
    ) {
      baseTitlePlacementY = '24px';
    } else if (
      next &&
      d.name === next.name &&
      ((d.value > 0 && next.value > 0) || (d.value < 0 && next.value < 0))
    ) {
      baseTitlePlacementY = '-12px';
    }

    return baseTitlePlacementY;
  };

  export const getMaxValue = (data) => {
    return Math.abs(
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
  };
}
