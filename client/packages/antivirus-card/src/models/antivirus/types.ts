import { DeleteFilesResponse, ScanSuccessData, LastScanData, PriceListPrice, CureFilesResponse } from './model';

export enum ANTIVIRUS_ACTION {
  SCAN_BEGIN = 'SCAN_BEGIN',
  SCANNING = 'SCANNING',
  SCAN_SUCCESS = 'SCAN_SUCCESS',
  SCAN_FAILURE = 'SCAN_FAILURE',

  GET_STATE_BEGIN = 'GET_STATE_BEGIN',
  GET_STATE_SUCCESS = 'GET_STATE_SUCCESS',
  GET_STATE_FAILURE = 'GET_STATE_FAILURE',

  GET_LAST_SCAN_SUCCESS = 'GET_LAST_SCAN_SUCCESS',
  GET_LAST_SCAN_FAILURE = 'GET_LAST_SCAN_FAILURE',

  SAVE_PARTIAL_PRESET_SUCCESS = 'SAVE_PARTIAL_PRESET_SUCCESS',

  SAVE_PRESET_FAILURE = 'SAVE_PRESET_FAILURE',

  SAVE_AND_SCAN_BEGIN = 'SAVE_AND_SCAN_BEGIN',
  SAVE_AND_SCAN_FAILURE = 'SAVE_AND_SCAN_FAILURE',
  SAVE_AND_SCAN_SUCCESS = 'SAVE_AND_SCAN_SUCCESS,',

  GET_INFECTED_FILES_SUCCESS = 'GET_INFECTED_FILES_SUCCESS',
  GET_INFECTED_FILES_FAILURE = 'GET_INFECTED_FILES_FAILURE',

  GET_PRESETS_SUCCESS = 'GET_PRESETS_SUCCESS',
  GET_PRESETS_FAILURE = 'GET_PRESETS_FAILURE',

  DISABLE_PRESET_SUCCESS = 'DISABLE_PRESET_SUCCESS',
  DISABLE_PRESET_FAILURE = 'DISABLE_PRESET_FAILURE',

  DELETE_FILES_SUCCESS = 'DELETE_FILES_SUCCESS',
  DELETE_FILES_FAILURE = 'DELETE_FILES_FAILURE',
  CURE_FILES_SUCCESS = 'CURE_FILES_SUCCESS',
  CURE_FILES_FAILURE = 'CURE_FILES_FAILURE',

  DELETE_FILES_POST_PROCESS_SUCCESS = 'DELETE_FILES_POST_PROCESS_SUCCESS',
  DELETE_FILES_POST_PROCESS_FAILURE = 'DELETE_FILES_POST_PROCESS_FAILURE',

  GET_PRICE_LIST_FAILURE = 'ANTIVIRUS_ACTION.GET_PRICE_LIST_FAILURE',
  GET_PRICE_LIST_SUCCESS = 'ANTIVIRUS_ACTION.GET_PRICE_LIST_SUCCESS',
  CURE_FILES_POST_PROCESS_SUCCESS = 'CURE_FILES_POST_PROCESS_SUCCESS',
  CURE_FILES_POST_PROCESS_FAILURE = 'CURE_FILES_POST_PROCESS_FAILURE',
}

export const scanBegin = () => async (dispatch: (obj: ScanBeginAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCAN_BEGIN,
  });
};

export const scanning = (data: { scanId: number }) => async (dispatch: (obj: ScanningAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCANNING,
    payload: { data },
  });
};

export const scanSuccess = (data: ScanSuccessData) => async (dispatch: (obj: ScanSuccessAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCAN_SUCCESS,
    payload: { data },
  });
};

export const scanFailure = error => async (dispatch: (obj: ScanFailureAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCAN_FAILURE,
    payload: { error },
  });
};

export const getStateBegin = () => async (dispatch: (obj: GetStateBeginAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_STATE_BEGIN,
  });
};

export const getStateSuccess = data => async (dispatch: (obj: GetStateSuccessAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_STATE_SUCCESS,
    payload: { data },
  });
};

export const getStateFailure = error => async (dispatch: (obj: GetStateFailureAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_STATE_FAILURE,
    payload: { error },
  });
};

export const getPriceListSuccess = data => async (dispatch: (obj: GetPriceListSuccessAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_PRICE_LIST_SUCCESS,
    payload: { data },
  });
};

export const getPriceListFailure = error => async (dispatch: (obj: GetPriceListFailureAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_PRICE_LIST_FAILURE,
    payload: { error },
  });
};

export const getLastScanSuccess = data => async (dispatch: (obj: GetLastScanSuccessAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_LAST_SCAN_SUCCESS,
    payload: { data },
  });
};

export const savePartialPresetSuccess = data => async (dispatch: (obj: SavePartialPresetSuccessAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_PARTIAL_PRESET_SUCCESS,
    payload: { data },
  });
};

export const savePresetFailure = error => async (dispatch: (obj: SavePresetFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_PRESET_FAILURE,
    payload: { error },
  });
};

export const getLastScanFailure = error => async (dispatch: (obj: GetLastScanFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_LAST_SCAN_FAILURE,
    payload: { error },
  });
};

export const saveAndScanBegin = () => (dispatch: (obj: SaveAndScanBeginAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_BEGIN,
  });
};

export const saveAndScanSuccess = () => (dispatch: (obj: SaveAndScanSuccessAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_SUCCESS,
  });
};

export const saveAndScanFailure = error => (dispatch: (obj: SaveAndScanFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_FAILURE,
    payload: { error },
  });
};

export const getInfectedFilesSuccess = data => async (dispatch: (obj: GetInfectedFilesSuccessAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_INFECTED_FILES_SUCCESS,
    payload: { data },
  });
};

export const getInfectedFilesFailure = error => async (dispatch: (obj: GetInfectedFilesFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_INFECTED_FILES_FAILURE,
    payload: { error },
  });
};

export const getPresetsSuccess = data => async (dispatch: (obj: GetPresetsSuccessAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_PRESETS_SUCCESS,
    payload: { data },
  });
};

export const getPresetsFailure = error => async (dispatch: (obj: GetPresetsFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_PRESETS_FAILURE,
    payload: { error },
  });
};

export const disablePresetFailure = error => async (dispatch: (obj: DisablePresetFailure) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.DISABLE_PRESET_FAILURE,
    payload: { error },
  });
};

export const disablePresetSuccess = data => async (dispatch: (obj: DisablePresetSuccess) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.DISABLE_PRESET_SUCCESS,
    payload: { data },
  });
};

export const deleteFilesSuccess = data => async (dispatch: (obj: DeleteFilesSuccess) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.DELETE_FILES_SUCCESS,
    payload: { data },
  });
};

export const deleteFilesFailure = error => async (dispatch: (obj: DeleteFilesFailure) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.DELETE_FILES_FAILURE,
    payload: { error },
  });
};

export const cureFilesSuccess = data => async (dispatch: (obj: CureFilesSuccess) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.CURE_FILES_SUCCESS,
    payload: { data },
  });
};

export const cureFilesFailure = error => async (dispatch: (obj: CureFilesFailure) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.CURE_FILES_FAILURE,
    payload: { error },
  });
};

export const cureFilesPostProcessSuccess = curedFilesCount => async (dispatch: (obj: CureFilesPostProcessSuccess) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.CURE_FILES_POST_PROCESS_SUCCESS,
    payload: { curedFilesCount },
  });
};

export const cureFilesPostProcessFailure = error => async (dispatch: (obj: CureFilesPostProcessFailure) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.CURE_FILES_POST_PROCESS_FAILURE,
    payload: { error },
  });
};

export const deleteFilesPostProcessSuccess = deletedFilesCount => async (dispatch: (obj: DeleteFilesPostProcessSuccess) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.DELETE_FILES_POST_PROCESS_SUCCESS,
    payload: { deletedFilesCount },
  });
};

export const deleteFilesPostProcessFailure = error => async (dispatch: (obj: DeleteFilesPostProcessFailure) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.DELETE_FILES_POST_PROCESS_FAILURE,
    payload: { error },
  });
};

interface ScanBeginAction {
  type: ANTIVIRUS_ACTION.SCAN_BEGIN;
}

interface ScanningAction {
  type: ANTIVIRUS_ACTION.SCANNING;
  payload: {
    data: {
      scanId: number;
    };
  };
}

interface SaveAndScanBeginAction {
  type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_BEGIN;
}

interface SaveAndScanFailureAction {
  type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_FAILURE;
  payload: any;
}

interface SaveAndScanSuccessAction {
  type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_SUCCESS;
}

interface ScanSuccessAction {
  type: ANTIVIRUS_ACTION.SCAN_SUCCESS;
  payload: { data: ScanSuccessData };
}

interface ScanFailureAction {
  type: ANTIVIRUS_ACTION.SCAN_FAILURE;
  payload: any;
}

interface GetStateBeginAction {
  type: ANTIVIRUS_ACTION.GET_STATE_BEGIN;
}

interface GetStateSuccessAction {
  type: ANTIVIRUS_ACTION.GET_STATE_SUCCESS;
  payload: any;
}

interface SavePartialPresetSuccessAction {
  type: ANTIVIRUS_ACTION.SAVE_PARTIAL_PRESET_SUCCESS;
  payload: any;
}

interface SavePresetFailureAction {
  type: ANTIVIRUS_ACTION.SAVE_PRESET_FAILURE;
  payload: any;
}

interface GetStateFailureAction {
  type: ANTIVIRUS_ACTION.GET_STATE_FAILURE;
  payload: any;
}

interface GetLastScanSuccessAction {
  type: ANTIVIRUS_ACTION.GET_LAST_SCAN_SUCCESS;
  payload: { data: LastScanData };
}

interface GetPriceListFailureAction {
  type: ANTIVIRUS_ACTION.GET_PRICE_LIST_FAILURE;
  payload: any;
}

interface GetPriceListSuccessAction {
  type: ANTIVIRUS_ACTION.GET_PRICE_LIST_SUCCESS;
  payload: { data: PriceListPrice[] };
}

interface GetLastScanFailureAction {
  type: ANTIVIRUS_ACTION.GET_LAST_SCAN_FAILURE;
  payload: any;
}

interface GetInfectedFilesSuccessAction {
  type: ANTIVIRUS_ACTION.GET_INFECTED_FILES_SUCCESS;
  payload: any;
}

interface GetInfectedFilesFailureAction {
  type: ANTIVIRUS_ACTION.GET_INFECTED_FILES_FAILURE;
  payload: any;
}

interface GetPresetsSuccessAction {
  type: ANTIVIRUS_ACTION.GET_PRESETS_SUCCESS;
  payload: any;
}

interface GetPresetsFailureAction {
  type: ANTIVIRUS_ACTION.GET_PRESETS_FAILURE;
  payload: any;
}

interface DisablePresetFailure {
  type: ANTIVIRUS_ACTION.DISABLE_PRESET_FAILURE;
  payload: any;
}

interface DisablePresetSuccess {
  type: ANTIVIRUS_ACTION.DISABLE_PRESET_SUCCESS;
  payload: any;
}

interface DeleteFilesSuccess {
  type: ANTIVIRUS_ACTION.DELETE_FILES_SUCCESS;
  payload: {
    data: DeleteFilesResponse;
  };
}

interface DeleteFilesFailure {
  type: ANTIVIRUS_ACTION.DELETE_FILES_FAILURE;
  payload: any;
}

interface CureFilesSuccess {
  type: ANTIVIRUS_ACTION.CURE_FILES_SUCCESS;
  payload: {
    data: CureFilesResponse;
  };
}

interface CureFilesFailure {
  type: ANTIVIRUS_ACTION.CURE_FILES_FAILURE;
  payload: any;
}

interface DeleteFilesPostProcessSuccess {
  type: ANTIVIRUS_ACTION.DELETE_FILES_POST_PROCESS_SUCCESS;
  payload: {
    deletedFilesCount: number;
  };
}
interface DeleteFilesPostProcessFailure {
  type: ANTIVIRUS_ACTION.DELETE_FILES_POST_PROCESS_FAILURE;
  payload: any;
}

interface CureFilesPostProcessSuccess {
  type: ANTIVIRUS_ACTION.CURE_FILES_POST_PROCESS_SUCCESS;
  payload: {
    curedFilesCount: number;
  };
}
interface CureFilesPostProcessFailure {
  type: ANTIVIRUS_ACTION.CURE_FILES_POST_PROCESS_FAILURE;
  payload: any;
}

export type AntivirusActionTypes =
  | ScanBeginAction
  | ScanningAction
  | ScanSuccessAction
  | ScanFailureAction
  | GetStateBeginAction
  | GetStateSuccessAction
  | GetStateFailureAction
  | GetLastScanSuccessAction
  | GetLastScanFailureAction
  | SavePartialPresetSuccessAction
  | SavePresetFailureAction
  | SaveAndScanBeginAction
  | SaveAndScanFailureAction
  | SaveAndScanSuccessAction
  | GetInfectedFilesSuccessAction
  | GetInfectedFilesFailureAction
  | GetPresetsSuccessAction
  | GetPresetsFailureAction
  | DisablePresetFailure
  | DisablePresetSuccess
  | DeleteFilesSuccess
  | DeleteFilesFailure
  | DeleteFilesPostProcessSuccess
  | DeleteFilesPostProcessFailure
  | GetPriceListSuccessAction
  | GetPriceListFailureAction
  | CureFilesSuccess
  | CureFilesFailure
  | CureFilesPostProcessSuccess
  | CureFilesPostProcessFailure;
