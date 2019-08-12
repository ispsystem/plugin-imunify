import { AntivirusState } from './state';
import { ANTIVIRUS_ACTION, AntivirusActionTypes } from './types';
import { BehaviorSubject } from 'rxjs';

const getInitialState = (): AntivirusState => {
  return {
    error: null,

    isProVersion: false,
    hasScheduledActions: false,
    infectedFiles: [],
    infectedFilesCount: 0,
    scanning: false,
    inBlackLists: false,
    history: [],
    historyItemCount: 0,
    taskList$: new BehaviorSubject([]),
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
        /** @todo understand what to do in this place with state */
        // infectedFiles: [
        //   // merge infected files with new scan result
        //   ...new Map((state.infectedFiles || []).concat(action.payload.data.infectedFiles.list).map(item => [item.id, item])).values(),
        // ],
        // history: [
        //   // add new item to the history list
        //   ...state.history,
        //   action.payload.data.historyItem,
        // ],
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

    case ANTIVIRUS_ACTION.GET_HISTORY_SUCCESS: {
      return {
        ...state,
        // history: action.payload.data.list,
        historyItemCount: action.payload.data.size,
      };
    }

    case ANTIVIRUS_ACTION.GET_HISTORY_FAILURE: {
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
        // infectedFiles: action.payload.data.list,
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
      const { ids } = action.payload;
      const infectedFiles = state.infectedFiles.map(file => {
        if (!ids.includes(file.id)) return file;
        file.status = 'DELETED';
        return file;
      });
      return {
        ...state,
        infectedFiles,
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
