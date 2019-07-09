import { AntivirusState } from './antivirus.reducers';

// import { sleep } from '../utils/tools';

const isDevMode = process.env.NODE_ENV !== 'production';
const endpoint = isDevMode ? 'http://localhost:8000' : '';

export namespace AntivirusActions {
  export function scan() {
    return async dispatch => {
      dispatch(scanBegin());

      // const plHeaders = new Headers({
      //   'Accept': 'application/json',
      //   'content-type': 'application/json'
      // });
      try {
        // const plHeaders = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        const requestInit: RequestInit = {
          method: 'POST',
          // headers: {
          //   // 'Accept': '*/*',
          //   // 'Content-Type': 'application/x-www-form-urlencoded',
          //   'Content-Type': 'application/json'
          // },
          // mode: 'no-cors',
          // headers: plHeaders,
          // headers: [['Content-Type', 'application/json'], ['Content-Type', 'text/plain']],
          body: JSON.stringify({ value: '1s' })
        };

        let response = await fetch(`${endpoint}/plugin/api/imunify/scan`, requestInit);
        handleErrors(response);

        let json = await response.json();

        dispatch(scanSuccess(json));
        return json.items;
      } catch (error) {
        dispatch(scanFailure(error));
      }
    };
  }

  export function feature() {
    return async dispatch => {
      dispatch(getStateBegin());

      try {
        const requestInit: RequestInit = {
          method: 'GET'
        };
        let response = await fetch(`${endpoint}/plugin/api/imunify/feature`, requestInit);
        handleErrors(response);
        let json = await response.json();

        dispatch(getStateSuccess(json));
        return json.items;
      } catch (error) {
        dispatch(getStateFailure(error));
      }
    };
  }

  export function updateState(state: AntivirusState) {
    return dispatch => {
      dispatch(getStateSuccess(state));
    }
  }

  function handleErrors(response) {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const contentType = response.headers.get('content-type');

    if (contentType === undefined || !contentType.includes('application/json')) {
      throw new TypeError("Oops, we haven't got JSON with a plugin service list!");
    }

    return response;
  }
}


export enum ANTIVIRUS_ACTION {
  SCAN_BEGIN = 'SCAN_BEGIN',
  SCAN_SUCCESS = 'SCAN_SUCCESS',
  SCAN_FAILURE = 'SCAN_FAILURE',

  GET_STATE_BEGIN = 'GET_STATE_BEGIN',
  GET_STATE_SUCCESS = 'GET_STATE_SUCCESS',
  GET_STATE_FAILURE = 'GET_STATE_FAILURE'
}

export const scanBegin = () => async (dispatch: (obj: ScanBeginAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCAN_BEGIN
  });
};

export const scanSuccess = data => async (dispatch: (obj: ScanSuccessAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCAN_SUCCESS,
    payload: { data }
  });
};

export const scanFailure = error => async (dispatch: (obj: ScanFailureAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCAN_FAILURE,
    payload: { error }
  });
};

export const getStateBegin = () => async (dispatch: (obj: GetStateBeginAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_STATE_BEGIN
  });
};

export const getStateSuccess = data => async (dispatch: (obj: GetStateSuccessAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_STATE_SUCCESS,
    payload: { data }
  });
};

export const getStateFailure = error => async (dispatch: (obj: GetStateFailureAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.GET_STATE_FAILURE,
    payload: { error }
  });
};

interface ScanBeginAction {
  type: ANTIVIRUS_ACTION.SCAN_BEGIN;
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
  | ScanSuccessAction
  | ScanFailureAction
  | GetStateBeginAction
  | GetStateSuccessAction
  | GetStateFailureAction;
