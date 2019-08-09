import { InfectedFile, HistoryItem } from './state';

/** Interface of scan action result */
export interface ScanResultResponse {
  historyItem: HistoryItem;
  infectedFiles: {
    list: InfectedFile[];
    size: number;
  };
}
