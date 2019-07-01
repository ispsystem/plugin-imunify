import { AntivirusActionTypes, ANTIVIRUS_ACTION } from './antivirus.actions';


interface InfectedFile {
  name: string;
  status: string;
  type: string;
  date: number;
  path: string;
  created: number;
  lastChange?: number;
}

export interface AntivirusState {
  error: any;

  isProVersion: boolean;
  hasScheduledActions: boolean;
  lastScan: string;

  scanning: boolean;
  infectedFiles: InfectedFile[];
  inBlackLists: boolean;
}

const getInitialState = () => {
  return {
    error: null,

    isProVersion: false,
    hasScheduledActions: false,
    lastScan: undefined,

    scanning: false,
    infectedFiles: [],
    inBlackLists: false,
  };
};

export const antivirusReducer = (
  state: AntivirusState = getInitialState(),
  action: AntivirusActionTypes
) => {
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
        items: action.payload.data
      };
    }

    case ANTIVIRUS_ACTION.SCAN_FAILURE: {
      return {
        ...state,
        scanning: false,
        error: action.payload.error
      };
    }
  }

  return state;
};