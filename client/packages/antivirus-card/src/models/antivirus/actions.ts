import { NotifierEvent } from '../../redux/reducers';
import {
  scanBegin,
  scanFailure,
  scanning,
  scanSuccess,
  getStateBegin,
  getStateSuccess,
  getStateFailure,
  getHistorySuccess,
  getHistoryFailure,
  savePartialPresetSuccess,
  savePresetFailure,
  saveAndScanFailure,
  saveAndScanBegin,
  saveAndScanSuccess,
  getInfectedFilesSuccess,
  getInfectedFilesFailure,
  getPresetsSuccess,
  getPresetsFailure,
  disablePresetSuccess,
  disablePresetFailure,
  deleteFilesSuccess,
  deleteFilesFailure,
  deleteFilesPostProcessSuccess,
  deleteFilesPostProcessFailure,
} from './types';
import { endpoint } from '../../constants';
import { AntivirusState, ScanOption, CheckType, InfectedFile } from './state';
import { getNestedObject } from '../../utils/tools';
import { UserNotification, NotifyBannerTypes } from '../../redux/user-notification.interface';
import { ITranslate } from '../translate.reducers';
import { ScanResultResponse } from './model';

/**
 *
 * Handle errors if response no ok or if it is not json format
 *
 * @param response - a fetch response obj
 */
export function handleErrors(response: Response): Response {
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
 * Actions for change antivirus state
 *
 */
export namespace AntivirusActions {
  /**
   * Deletes the file or files
   *
   * @param siteId Site's id
   * @param fileIds File's id
   */
  export function deleteFiles(siteId: number, fileIds: number[]) {
    return async dispatch => {
      try {
        const body = {
          files: fileIds,
        };
        const requestInit: RequestInit = {
          method: 'DELETE',
          body: JSON.stringify(body),
        };
        let response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/files`, requestInit);
        handleErrors(response);
        let json = await response.json();

        dispatch(deleteFilesSuccess(json));
      } catch (error) {
        dispatch(deleteFilesFailure(error));
      }
    };
  }

  export function deleteFilesPostProcess(notify: { event: NotifierEvent }) {
    return dispatch => {
      try {
        const results = getNestedObject(notify, ['event', 'additional_data', 'output', 'content', 'result']);
        let deletedFiles: InfectedFile[] = results.filter(file => file.status === 'success');
        let ids: number[] = deletedFiles.map(file => Number(file.id));
        dispatch(deleteFilesPostProcessSuccess(ids));
      } catch (error) {
        dispatch(deleteFilesPostProcessFailure(error));
      }
    };
  }

  /**
   * Search viruses
   *
   * @param presetId - scan options preset Id
   * @param siteId - vepp site ID
   */
  export function scan(presetId: number, siteId: number) {
    return async dispatch => {
      dispatch(scanBegin());
      try {
        const requestInit: RequestInit = {
          method: 'POST',
          body: JSON.stringify({ preset_id: presetId }),
        };

        let response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/scan`, requestInit);
        handleErrors(response);

        let json = await response.json();

        dispatch(scanning({ scanId: json.task_id }));
      } catch (error) {
        dispatch(scanFailure(error));
      }
    };
  }

  /**
   *
   * Get scan result
   *
   * @param notify - result from notifier
   */
  export function getScanResult(notify: { event: NotifierEvent }, userNotification: UserNotification, t: ITranslate) {
    return async dispatch => {
      try {
        const started = getNestedObject(notify, ['event', 'additional_data', 'output', 'content', 'scan', 'started']);
        const taskId = notify.event.id;
        if (started !== undefined && taskId !== undefined) {
          let response = await fetch(`${endpoint}/plugin/api/imunify/scan/result?task_id=${notify.event.id}&started=${started}`);
          handleErrors(response);
          const data: ScanResultResponse = await response.json();
          data.infectedFiles.list.forEach(file => {
            if (file.status === 'INFECTED') {
              userNotification.push({ title: t.msg(['VIRUS_DETECTED']), content: file.threatName, type: NotifyBannerTypes.ERROR_FAST });
            }
          });
          dispatch(scanSuccess(data));
        } else {
          throw 'Can not found object started or taskId in a notify!';
        }
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
      } catch (error) {
        dispatch(getStateFailure(error));
      }
    };
  }

  /**
   * Save new presets for scanning
   *
   * @param preset - scan options
   * @param siteId - site id
   * @param scanType - check type 'FULL' or 'PARTIAL'
   */
  export function savePreset(preset: Omit<ScanOption, 'id' | 'docroot'>, siteId: number, scanType: CheckType = 'PARTIAL') {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'POST',
          body: JSON.stringify({ scan_type: scanType, preset: { ...preset } }),
        };
        let response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/preset`, requestInit);

        handleErrors(response);

        const json: { preset_id: number } = await response.json();

        if (scanType === 'PARTIAL') {
          dispatch(savePartialPresetSuccess({ ...preset, id: json.preset_id }));
        } else if (scanType === 'FULL') {
          /** @todo add handle for save full preset */
          // dispatch(saveFullPresetSuccess({ ...preset, id: json.preset_id }));
        }
        return json.preset_id;
      } catch (error) {
        dispatch(savePresetFailure(error));
        /** @todo: need refactoring */
        return { error };
      }
    };
  }

  /**
   * Save preset and run scan by it
   *
   * @param preset - scan options
   * @param siteId - site id
   * @param scanType - check type 'FULL' or 'PARTIAL'
   */
  export function saveAndScan(preset: Omit<ScanOption, 'id' | 'docroot'>, siteId: number, scanType: CheckType = 'PARTIAL') {
    return async dispatch => {
      dispatch(saveAndScanBegin());
      try {
        const presetId = await savePreset(preset, siteId, scanType)(dispatch);
        /** @todo: need refactoring */
        if (typeof presetId === 'number') {
          await scan(presetId, siteId)(dispatch);
        } else {
          dispatch(saveAndScanFailure(presetId['error']));
          return presetId;
        }
        dispatch(saveAndScanSuccess());
      } catch (error) {
        dispatch(saveAndScanFailure(error));
        return { error };
      }
    };
  }

  /**
   * Get scanning history
   *
   * @param siteId - site ID from vepp
   */
  export function history(siteId: number) {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'GET',
        };
        let response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/scan/history?limit=0`, requestInit);
        handleErrors(response);
        let json = await response.json();

        dispatch(getHistorySuccess(json));
      } catch (error) {
        dispatch(getHistoryFailure(error));
      }
    };
  }

  /**
   * Get list infected files
   *
   * @param siteId - site ID from vepp
   */
  export function infectedFiles(siteId: number) {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'GET',
        };
        let response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/files/infected?limit=0`, requestInit);
        handleErrors(response);
        let json = await response.json();

        dispatch(getInfectedFilesSuccess(json));
      } catch (error) {
        dispatch(getInfectedFilesFailure(error));
      }
    };
  }

  /**
   * Get active scan presets
   *
   * @param siteId - site ID from vepp
   */
  export function scanSettingPresets(siteId: number) {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'GET',
        };
        let response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/presets`, requestInit);
        handleErrors(response);
        let json = await response.json();

        dispatch(getPresetsSuccess(json));
      } catch (error) {
        dispatch(getPresetsFailure(error));
      }
    };
  }

  /**
   * Action for disable preset by id
   *
   * @param presetId - id
   */
  export function disablePreset(presetId: number) {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'POST',
          body: JSON.stringify({ is_active: false }),
        };
        let response = await fetch(`${endpoint}/plugin/api/imunify/preset/${presetId}/status`, requestInit);
        handleErrors(response);
        let json = await response.json();

        dispatch(disablePresetSuccess(json));
      } catch (error) {
        dispatch(disablePresetFailure(error));
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
