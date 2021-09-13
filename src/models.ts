export interface PerformAnalysisRequest {
  path: string;
}

export interface NPMReleasesVersionsProvider {
  type: 'NPMReleases';
  package_name: string;
}

export interface AnalysisObject {
  name: string;
  versions: (string | null)[];
  versions_providers?: NPMReleasesVersionsProvider[];
}

export interface AnalysisEcoSystemResult {
  name: string;
  objects: AnalysisObject[];
}
