import { Preset, HistoryItem } from './types';

export namespace API {
  export interface GetPresetsResponse {
    full: Preset;
    partial?: Preset;
  }

  export interface GetFeatureResponse {
    hasScheduledActions: boolean;
    isProVersion: boolean;
  }

  export interface GetInfectedFilesResponse {
    list: any[];
    size: number;
  }

  export interface GetLastScanResponse {
    list: HistoryItem[];
    size: number;
  }

  export interface GetScanResultResponse {
    infectedFiles: GetInfectedFilesResponse;
    historyItem: HistoryItem;
  }

  export interface ScanResponse {
    started: number;
    task_id: number;
  }
}
