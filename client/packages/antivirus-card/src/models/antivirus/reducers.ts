import { AntivirusState } from './state';
import { ANTIVIRUS_ACTION, AntivirusActionTypes } from './types';
import { BehaviorSubject } from 'rxjs';
import { PricePeriodType } from './model';

const getInitialState = (): AntivirusState => {
  return {
    error: null,

    isProVersion: false,
    hasScheduledActions: false,
    infectedFilesCount: 0,
    scanning: false,
    inBlackLists: false,
    historyItemCount: 0,
    lastScan: {
      full: null,
      partial: null,
    },
    taskList$: new BehaviorSubject([]),
    priceList: [],
  };
};

export const antivirusReducer = (state: AntivirusState = getInitialState(), action: AntivirusActionTypes): AntivirusState => {
  switch (action.type) {
    case ANTIVIRUS_ACTION.SCAN_BEGIN: {
      return {
        ...state,
        scanning: true,
        error: null,
      };
    }

    case ANTIVIRUS_ACTION.SCANNING: {
      state.taskList$.next([...state.taskList$.getValue(), action.payload.data.scanId]);
      return {
        ...state,
        scanning: true,
        error: null,
      };
    }

    case ANTIVIRUS_ACTION.SCAN_SUCCESS: {
      return {
        ...state,
        scanning: false,
        infectedFilesCount: action.payload.data.infectedFilesCount,
        lastScan: {
          full: action.payload.data.historyItem.checkType === 'FULL' ? action.payload.data.historyItem : state.lastScan.full,
          partial: action.payload.data.historyItem.checkType === 'PARTIAL' ? action.payload.data.historyItem : state.lastScan.partial,
        },
        historyItemCount: state.historyItemCount++,
      };
    }

    case ANTIVIRUS_ACTION.SCAN_FAILURE: {
      return {
        ...state,
        scanning: false,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.GET_STATE_BEGIN: {
      return {
        ...state,
        error: null,
      };
    }

    case ANTIVIRUS_ACTION.GET_STATE_SUCCESS: {
      return {
        ...state,
        ...action.payload.data,
      };
    }

    case ANTIVIRUS_ACTION.GET_STATE_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.GET_PRICE_LIST_SUCCESS: {
      return {
        ...state,
        priceList: action.payload.data,
      };
    }

    case ANTIVIRUS_ACTION.GET_PRICE_LIST_FAILURE: {
      return {
        ...state,
        /** @todo DELETE THIS MOCK DATA */
        priceList: [
          {
            id: '0',
            cost: 5,
            currency: 'EUR',
            type: PricePeriodType.month,
            length: 1,
          },
        ],
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.GET_LAST_SCAN_SUCCESS: {
      return {
        ...state,
        // history: action.payload.data.list,
        historyItemCount: action.payload.data.size,
        lastScan: {
          full: action.payload.data.full,
          partial: action.payload.data.partial,
        },
      };
    }

    case ANTIVIRUS_ACTION.GET_LAST_SCAN_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.SAVE_PARTIAL_PRESET_SUCCESS: {
      return {
        ...state,
        scanPreset: {
          ...state.scanPreset,
          partial: action.payload.data,
        },
        error: null,
      };
    }

    case ANTIVIRUS_ACTION.SAVE_PRESET_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.GET_INFECTED_FILES_SUCCESS: {
      return {
        ...state,
        infectedFilesCount: action.payload.data.size,
      };
    }

    case ANTIVIRUS_ACTION.GET_INFECTED_FILES_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.GET_PRESETS_SUCCESS: {
      const scanPreset = {
        full: action.payload.data.full,
      };
      if (action.payload.data.partial !== undefined && action.payload.data.partial.isActive) {
        scanPreset['partial'] = action.payload.data.partial;
      }
      return {
        ...state,
        scanPreset,
      };
    }

    case ANTIVIRUS_ACTION.GET_PRESETS_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.DISABLE_PRESET_SUCCESS: {
      delete state.scanPreset.partial;
      return {
        ...state,
        scanPreset: { ...state.scanPreset },
      };
    }

    case ANTIVIRUS_ACTION.DISABLE_PRESET_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.DELETE_FILES_SUCCESS: {
      state.taskList$.next([...state.taskList$.getValue(), action.payload.data.task_id]);
      return {
        ...state,
        error: null,
      };
    }

    case ANTIVIRUS_ACTION.DELETE_FILES_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.DELETE_FILES_POST_PROCESS_SUCCESS: {
      const { deletedFilesCount } = action.payload;
      let infectedFilesCount = state.infectedFilesCount - deletedFilesCount;
      if (infectedFilesCount < 0) {
        infectedFilesCount = 0;
      }
      return {
        ...state,
        infectedFilesCount,
      };
    }

    case ANTIVIRUS_ACTION.DELETE_FILES_POST_PROCESS_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }

    case ANTIVIRUS_ACTION.CURE_FILES_POST_PROCESS_SUCCESS: {
      const { curedFilesCount } = action.payload;
      let infectedFilesCount = state.infectedFilesCount - curedFilesCount;
      if (infectedFilesCount < 0) {
        infectedFilesCount = 0;
      }
      return {
        ...state,
        infectedFilesCount,
      };
    }

    case ANTIVIRUS_ACTION.DELETE_FILES_POST_PROCESS_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
      };
    }
  }

  return state;
};
