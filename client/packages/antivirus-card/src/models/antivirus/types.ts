export enum ANTIVIRUS_ACTION {
  SCAN_BEGIN = 'SCAN_BEGIN',
  SCANNING = 'SCANNING',
  SCAN_SUCCESS = 'SCAN_SUCCESS',
  SCAN_FAILURE = 'SCAN_FAILURE',
  GET_STATE_BEGIN = 'GET_STATE_BEGIN',
  GET_STATE_SUCCESS = 'GET_STATE_SUCCESS',
  GET_STATE_FAILURE = 'GET_STATE_FAILURE',
  GET_HISTORY_SUCCESS = 'GET_HISTORY_SUCCESS',
  GET_HISTORY_FAILURE = 'GET_HISTORY_FAILURE',
  SAVE_PARTIAL_PRESET_SUCCESS = 'SAVE_PARTIAL_PRESET_SUCCESS',
  SAVE_PRESET_FAILURE = 'SAVE_PRESET_FAILURE',
  SAVE_AND_SCAN_BEGIN = 'SAVE_AND_SCAN_BEGIN',
  SAVE_AND_SCAN_FAILURE = 'SAVE_AND_SCAN_FAILURE',
  SAVE_AND_SCAN_SUCCESS = 'SAVE_AND_SCAN_SUCCESS,',
}

export const scanBegin = () => async (dispatch: (obj: ScanBeginAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCAN_BEGIN,
  });
};

export const scanning = () => async (dispatch: (obj: ScanningAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCANNING,
  });
};

export const scanSuccess = data => async (dispatch: (obj: ScanSuccessAction) => any, _getState) => {
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

export const getHistorySuccess = data => async (dispatch: (obj: GetHistorySuccessAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_HISTORY_SUCCESS,
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

export const getHistoryFailure = error => async (dispatch: (obj: GetHistoryFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_HISTORY_FAILURE,
    payload: { error },
  });
};

export const saveAndScanBegin = () => (dispatch: (obj: SaveAndScanBeginAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_BEGIN,
  });
};

export const saveAndScanFailure = error => (dispatch: (obj: SaveAndScanFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_FAILURE,
    payload: { error },
  });
};

export const saveAndScanSuccess = () => (dispatch: (obj: SaveAndScanSuccessAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_AND_SCAN_SUCCESS,
  });
};

interface ScanBeginAction {
  type: ANTIVIRUS_ACTION.SCAN_BEGIN;
}

interface ScanningAction {
  type: ANTIVIRUS_ACTION.SCANNING;
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
  payload: any;
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

interface GetHistorySuccessAction {
  type: ANTIVIRUS_ACTION.GET_HISTORY_SUCCESS;
  payload: any;
}

interface GetHistoryFailureAction {
  type: ANTIVIRUS_ACTION.GET_HISTORY_FAILURE;
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
  | GetHistorySuccessAction
  | GetHistoryFailureAction
  | SavePartialPresetSuccessAction
  | SavePresetFailureAction
  | SaveAndScanBeginAction
  | SaveAndScanFailureAction
  | SaveAndScanSuccessAction;
