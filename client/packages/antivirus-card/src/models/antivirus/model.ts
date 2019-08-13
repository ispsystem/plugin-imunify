import { InfectedFile, HistoryItem } from './state';

/** Interface of scan action result */
export interface ScanResultResponse {
  historyItem: HistoryItem;
  infectedFiles: {
    list: InfectedFile[];
    size: number;
  };
}

export interface TaskManagerResponse {
  task_id: number;
}

export interface DeleteFilesResponse extends TaskManagerResponse {}
