import { AntivirusActionTypes, ANTIVIRUS_ACTION } from './antivirus.actions';

/**
 * Infected file
 */
interface InfectedFile {
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

  // scanning flag
  scanning: boolean;
  // domain in black list
  inBlackLists: boolean;

  infectedFiles: InfectedFile[];
  history: HistoryItem[];
}

const getInitialState = (): AntivirusState => {
  return {
    error: null,

    isProVersion: false,
    hasScheduledActions: false,

    scanning: false,
    infectedFiles: [],
    inBlackLists: false,
    history: []
  };
};

export const antivirusReducer = (state: AntivirusState = getInitialState(), action: AntivirusActionTypes) => {
  switch (action.type) {
    case ANTIVIRUS_ACTION.SCAN_BEGIN: {
      return {
        ...state,
        scanning: true,
        error: null
      };
    }

    case ANTIVIRUS_ACTION.SCAN_SUCCESS: {
      return {
        ...state,
        scanning: false,
        scanResult: action.payload.data
      };
    }

    case ANTIVIRUS_ACTION.SCAN_FAILURE: {
      return {
        ...state,
        scanning: false,
        error: action.payload.error
      };
    }

    case ANTIVIRUS_ACTION.GET_STATE_BEGIN: {
      return {
        ...state,
        error: null
      };
    }

    case ANTIVIRUS_ACTION.GET_STATE_SUCCESS: {
      return {
        ...state,
        ...action.payload.data
      };
    }

    case ANTIVIRUS_ACTION.GET_STATE_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
  }

  return state;
};
