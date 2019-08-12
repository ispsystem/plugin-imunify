import { BehaviorSubject } from 'rxjs';

/** Types for inspected files status */
export type InfectedStatusType = 'INFECTED' | 'CURED' | 'EXCEPTED' | 'HEALING';

/**
 * Infected file
 */
export interface InfectedFile {
  id: number;
  // file name, e.g. "beregovoi_orcestr.bat"
  name: string;
  // file status, e.g. "заражён"
  status: InfectedStatusType;
  // type of threat, e.g. "Troyan.enspect"
  threatName: string;
  // path to file
  path: string;
  // date and time when the file was detected (timestamp)
  detectionDate: number;
  // date and time when the file was created (timestamp)
  createdDate: number;
  // date and time when the file was changed (timestamp)
  lastChangeDate?: number;
}

/**
 * History list item
 */
export interface HistoryItem {
  // verification date and time (timestamp)
  date: number;
  // check type
  checkType: CheckType;
  // count infected files
  infectedFilesCount: number;
  // count cured files
  curedFilesCount: number;
  // scan options preset ID
  scanOptionId: number;
}

/**
 * Presets type
 */
export type CheckType = 'FULL' | 'PARTIAL';

/**
 * Type for scanning intensity
 */
export type IntensityType = 'LOW' | 'MEDIUM' | 'HIGH';

/** Type for file check */
export type CheckFileType = 'critical' | 'all' | 'except_media';

/**
 * Scan option list item
 */
export interface ScanOption {
  id: number;
  path: string[];
  docroot: string;
  checkMask: string[];
  excludeMask: string[];
  intensity: IntensityType;
  scheduleTime: {
    daily?: {
      hour: number;
      minutes: number;
    };
    single?: {
      date: number;
    };
    weekly?: {
      day: number;
      time: {
        hour: number;
        minutes: number;
      };
    };
    monthly?: {
      day: number;
      time: {
        hour: number;
        minutes: number;
      };
    };
  };
  checkFileTypes: CheckFileType;
  saveCopyFilesDay: number;
  cureFoundFiles: boolean;
  removeInfectedFileContent: boolean;
  checkDomainReputation: boolean;
  email: string;
  parallelChecks: number;
  ramForCheck: number;
  fullLogDetails: boolean;
  maxScanTime: number;
  autoUpdate: boolean;
  isActive: boolean;
}

/**
 * Global antivirus state
 */
export interface AntivirusState {
  // global state error
  error: any;

  // features
  isProVersion: boolean;
  hasScheduledActions: boolean;

  // actual scan options
  scanPreset?: {
    full: ScanOption;
    partial?: ScanOption;
  };
  // scanning flag
  scanning: boolean;
  // domain in black list
  inBlackLists: boolean;

  infectedFiles: InfectedFile[];
  infectedFilesCount: number;
  history: HistoryItem[];
  historyItemCount: number;
  scanTaskList$: BehaviorSubject<number[]>;
}
