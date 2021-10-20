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
  }
}
