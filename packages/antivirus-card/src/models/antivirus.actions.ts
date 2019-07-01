import { sleep } from '../utils/tools';

export namespace AntivirusActions {
  export function scan() {
    return async dispatch => {
      dispatch(scanBegin());

      try {
        let response = await fetch('/assets/test-data.json');
        handleErrors(response);

        let json: { items: string[] } = await response.json();

        await sleep(3000);

        dispatch(scanSuccess(json.items));
        return json.items;
      } catch (error) {
        dispatch(scanFailure(error));
      }
    };
  }

  function handleErrors(response) {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  }
}

export enum ANTIVIRUS_ACTION {
  SCAN_BEGIN = 'SCAN_BEGIN',
  SCAN_SUCCESS = 'SCAN_SUCCESS',
  SCAN_FAILURE = 'SCAN_FAILURE'
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

export type AntivirusActionTypes = ScanBeginAction | ScanSuccessAction | ScanFailureAction;
