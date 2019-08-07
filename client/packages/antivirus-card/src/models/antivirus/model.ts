import { InfectedFile, HistoryItem } from './state';

export interface ScanResultResponse {
  historyItem: HistoryItem;
  infectedFiles: {
    list: InfectedFile[];
    size: number;
  };
}
