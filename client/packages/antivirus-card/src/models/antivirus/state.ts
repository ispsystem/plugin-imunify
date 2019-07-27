/**
 * Infected file
 */
export interface InfectedFile {
  id: number;
  // file name, e.g. "beregovoi_orcestr.bat"
  name: string;
  // file status, e.g. "заражён"
  status: 'INFECTED' | 'CURED' | 'EXCEPTED' | 'HEALING';
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
interface HistoryItem {
  // verification date and time (timestamp)
  date: number;
  // check type
  checkType: 'FULL' | 'PARTIAL';
  // count infected files
  infectedFilesCount: number;
  // count cured files
  curedFilesCount: number;

  scanOptionId: number;
}

/**
 * Scan option list item
 */
export interface ScanOption {
  id: number;
  path: string[];
  checkMask: string[];
  excludeMask: string[];
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
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
  checkFileTypes: 'CRITICAL' | 'ALL' | 'EXCEPT_MEDIA';
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
    partial: ScanOption;
  };
  // scanning flag
  scanning: boolean;
  // domain in black list
  inBlackLists: boolean;

  infectedFiles: InfectedFile[];
  history: HistoryItem[];
}
