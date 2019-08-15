import { InfectedFile, HistoryItem } from './state';
import { JSX } from '@stencil/core';

/** Interface of scan action result */
export interface ScanResultResponse {
  historyItem: HistoryItem;
  infectedFiles: {
    list: InfectedFile[];
    size: number;
  };
}

/** Enumirable for card pages */
export enum AntivirusCardPages {
  dashboard = 'dashboard',
  infectedFiles = 'infectedFiles',
  history = 'history',
}

/** Interface for navigation by antivirus card */
export interface NavigationItem {
  name: AntivirusCardPages;
  label: string;
  active?: boolean;
  component: () => JSX.Element;
  hidden?: boolean;
}

/** Interface for data after scan success */
export interface ScanSuccessData extends ScanResultResponse {
  infectedFilesCount: number;
}

/** Common response for get list */
export interface GetListResponse<T> {
  list: T[];
  size: number;
}

/** Response by infected file list query */
export interface GetInfectedFilesResponse extends GetListResponse<InfectedFile> {}

/** Common response for task manager */
export interface TaskManagerResponse {
  task_id: number;
}

export interface DeleteFilesResponse extends TaskManagerResponse {}

/** Antivirus task event names */
export enum TaskEventName {
  scan = 'scan',
  heal = 'files-heal',
  filesDelete = 'files',
}

/** Response by last scan action */
export interface GetLastScanResponse extends GetListResponse<HistoryItem> {}

/** Interface for last scan in state */
export interface LastScanData {
  full: HistoryItem;
  partial: HistoryItem;
  size: number;
}

/** Payment status returned by payment system */
export type PaymentStatus = 'failed' | 'success';

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
