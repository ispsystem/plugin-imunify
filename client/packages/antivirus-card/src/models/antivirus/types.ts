export enum ANTIVIRUS_ACTION {
  SCAN_BEGIN = 'SCAN_BEGIN',
  SCANNING = 'SCANNING',
  SCAN_SUCCESS = 'SCAN_SUCCESS',
  SCAN_FAILURE = 'SCAN_FAILURE',

  GET_STATE_BEGIN = 'GET_STATE_BEGIN',
  GET_STATE_SUCCESS = 'GET_STATE_SUCCESS',
  GET_STATE_FAILURE = 'GET_STATE_FAILURE',
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

interface GetStateFailureAction {
  type: ANTIVIRUS_ACTION.GET_STATE_FAILURE;
  payload: any;
}

export type AntivirusActionTypes =
  | ScanBeginAction
  | ScanningAction
  | ScanSuccessAction
  | ScanFailureAction
  | GetStateBeginAction
  | GetStateSuccessAction
  | GetStateFailureAction;