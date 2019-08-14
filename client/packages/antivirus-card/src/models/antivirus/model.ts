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

export interface ScanSuccessData extends ScanResultResponse {
  infectedFilesCount: number;
}

export interface GetInfectedFilesResponse {
  list: any[];
  size: number;
}

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
export interface GetLastScanResponse {
  list: HistoryItem[];
  size: number;
}

export interface LastScanData {
  full: HistoryItem;
  partial: HistoryItem;
  size: number;
}
