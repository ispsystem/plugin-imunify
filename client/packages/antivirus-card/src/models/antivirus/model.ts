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

/** Interface for get prise list response */
export interface PriceListResponse {
  list: {
    id: string;
    name: string;
    description: string;
    identifier: string;
    type: string;
    price: PriceListPrice[];
  }[];
}

/** Interface for price list price */
export interface PriceListPrice {
  id: string;
  length?: number;
  type: PricePeriodType;
  currency: string;
  cost: number;
}

/** Periods for price */
export enum PricePeriodType {
  day = 'day',
  month = 'month',
  year = 'year',
  lifetime = 'lifetime',
  trial = 'trial',
}
