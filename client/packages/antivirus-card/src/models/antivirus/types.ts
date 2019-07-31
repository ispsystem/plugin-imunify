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
export const savePartialPresetSuccess = data => async (dispatch: (obj: SavePartialPresetSuccess) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SAVE_PARTIAL_PRESET_SUCCESS,
    payload: { data },
  });
};

export const getHistoryFailure = error => async (dispatch: (obj: GetHistoryFailureAction) => void) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_HISTORY_FAILURE,
    payload: { error },
  });
};

interface ScanBeginAction {
  type: ANTIVIRUS_ACTION.SCAN_BEGIN;
}
interface ScanningAction {
  type: ANTIVIRUS_ACTION.SCANNING;
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

interface SavePartialPresetSuccess {
  type: ANTIVIRUS_ACTION.SAVE_PARTIAL_PRESET_SUCCESS;
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
  | SavePartialPresetSuccess;
