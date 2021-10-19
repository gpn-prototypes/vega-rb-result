export namespace SensitiveAnalysisChart {
  export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export const Margin: Margin = {
    top: 20,
    right: 13,
    bottom: 0,
    left: 83,
  };
  export const Width = 626 - Margin.left - Margin.right;
  export const Height = 243 - Margin.top - Margin.bottom;
}
