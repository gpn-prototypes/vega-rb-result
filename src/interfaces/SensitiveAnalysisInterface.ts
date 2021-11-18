export interface SensitiveAnalysis {
  names: string[];
  percentiles: number[][];
  resultMinMax: number[][];
  zeroPoint: number;
}

export interface SensitiveAnalysisStatisticHeaders {
  code: string;
  name: string;
  decimal?: number;
  children?: SensitiveAnalysisStatisticHeaders[];
}

export interface SensitiveAnalysisStatisticCell {
  code: string;
  value: string;
}

export interface SensitiveAnalysisStatisticRows {
  cells: SensitiveAnalysisStatisticCell[];
}

export interface SensitiveAnalysisStatistic {
  headers: SensitiveAnalysisStatisticHeaders[];
  rows: SensitiveAnalysisStatisticRows[];
}
