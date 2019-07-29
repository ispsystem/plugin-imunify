import { Notifier, NotifierEvent } from '../../redux/reducers';
import { scanBegin, scanFailure, scanning, scanSuccess, getStateBegin, getStateSuccess, getStateFailure } from './types';
import { endpoint } from '../../constants';
import { Observable } from 'rxjs';
import { AntivirusState, InfectedFile } from './state';
import { getNestedObject } from '../../utils/tools';

/**
 *
 * Handle errors if response no ok or if it is not json format
 *
 * @param response - a fetch response obj
 */
function handleErrors(response: Response): Response {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const contentType = response.headers.get('content-type');

  if (contentType === undefined || !contentType.includes('application/json')) {
    throw new TypeError('Oops, we have not got JSON with a plugin service list!');
  }

  return response;
}

/**
 *
 * Get scan result
 *
 * @param notify - result from notifier
 */
async function getScanResult(notify: { event: NotifierEvent }): Promise<InfectedFile[]> {
  const started = getNestedObject(notify, ['event', 'additional_data', 'output', 'content', 'scan', 'started']);
  const taskId = notify.event.id;
  if (started !== undefined && taskId !== undefined) {
    let response = await fetch(`${endpoint}/plugin/api/imunify/scan/result?task_id=${notify.event.id}&started=${started}`);
    handleErrors(response);

    return await response.json();
  }
}

/**
 *
 * Actions for change antivirus state
 *
 */
export namespace AntivirusActions {
  /**
   * Search viruses
   *
   * @param notifier - main app notifier object
   */
  export function scan(notifier: Notifier) {
    return async dispatch => {
      dispatch(scanBegin());
      try {
        const requestInit: RequestInit = {
          method: 'POST',
          body: JSON.stringify({ scan_path: '/var/www/www-root/', site_id: 1 }),
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
  export function waitScanResult(notifier: Notifier, ids: number[] | Observable<number[]>) {
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

  /**
   * Get current antivirus available features
   */
  export function feature() {
    return async dispatch => {
      dispatch(getStateBegin());

      try {
        const requestInit: RequestInit = {
          method: 'GET',
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

  /**
   * Update antivirus state
   *
   * @param state - new state
   */
  export function updateState(state: AntivirusState) {
    return dispatch => {
      dispatch(getStateSuccess(state));
    };
  }
}