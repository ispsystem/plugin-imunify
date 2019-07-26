import { AntivirusState } from './antivirus.reducers';
import { INotifier, ISPNotifierEvent } from '../redux/reducers';
import { endpoint } from '../constants';
import { Observable } from 'rxjs';
import { getNestedObject } from '../utils/tools';

export namespace AntivirusActions {
  export function scan(notifier: INotifier) {
    return async dispatch => {
      dispatch(scanBegin());
      try {
        const requestInit: RequestInit = {
          method: 'POST',
          body: JSON.stringify({ scan_path: '/var/www/www-root/', site_id: 1 })
        };

        let response = await fetch(`${endpoint}/plugin/api/imunify/scan`, requestInit);
        handleErrors(response);

        let json = await response.json();

        notifier.ids([json.task_id]).delete$();
      } catch (error) {
        dispatch(scanFailure(error));
      }
    };
  }

  /**
   * Wait when scan tasks finish
   * 
   * @param notifier - notifier from main app
   * @param ids - tasks
   */
  export function waitScanResult(notifier: INotifier, ids: number[] | Observable<number[]>) {
    return async dispatch => {
      dispatch(scanning());
      try {
        notifier
          .ids(ids)
          .delete$()
          .subscribe(async d => {
            const scanResult = await getScanResult(d);

            dispatch(scanSuccess(scanResult));
          });
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
    };
  }

  /**
   * Get scan result
   * 
   * @param notify - result from notifier
   */
  async function getScanResult(notify: { event: ISPNotifierEvent }) {
    const started = getNestedObject(notify, ['event', 'additional_data', 'output', 'content', 'scan', 'started']);
    const task_id = notify.event.id;
    if (started !== undefined && task_id !== undefined) {
      let response = await fetch(
        `${endpoint}/plugin/api/imunify/scan/result?task_id=${notify.event.id}&started=${
          notify.event.additional_data.output.content.scan.started
        }`
      );
      handleErrors(response);

      return await response.json();
    }
  }

  function handleErrors(response) {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const contentType = response.headers.get('content-type');

    if (contentType === undefined || !contentType.includes('application/json')) {
      throw new TypeError('Oops, we have not got JSON with a plugin service list!');
    }

    return response;
  }
}

export enum ANTIVIRUS_ACTION {
  SCAN_BEGIN = 'SCAN_BEGIN',
  SCANNING = 'SCANNING',
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

export const scanning = () => async (dispatch: (obj: ScanningAction) => any, _getState) => {
  return dispatch({
    type: ANTIVIRUS_ACTION.SCANNING
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
