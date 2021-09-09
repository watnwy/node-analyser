export interface PerformAnalysisRequest {
  path: string;
}

export interface AnalysisObject {
  name: string;
  versions: (string | null)[];
}

export interface AnalysisEcoSystemResult {
  name: string;
  objects: AnalysisObject[];
}
