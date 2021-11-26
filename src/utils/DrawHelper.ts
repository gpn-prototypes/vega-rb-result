import * as d3 from 'd3';

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
    d3.scaleLinear().domain(domain).nice().range(position);

  /** Домен */
  export const getDomain = (
    points: Point[],
    func: (d: Point) => number,
  ): number[] => [
    d3.min(points, func) as number,
    d3.max(points, func) as number,
  ];
}
