import { NotifierEvent } from '../../redux/reducers';
import {
  deleteFilesFailure,
  deleteFilesPostProcessFailure,
  deleteFilesPostProcessSuccess,
  deleteFilesSuccess,
  disablePresetFailure,
  disablePresetSuccess,
  getHistoryFailure,
  getHistorySuccess,
  getInfectedFilesFailure,
  getInfectedFilesSuccess,
  getPresetsFailure,
  getPresetsSuccess,
  getStateBegin,
  getStateFailure,
  getStateSuccess,
  saveAndScanBegin,
  saveAndScanFailure,
  saveAndScanSuccess,
  savePartialPresetSuccess,
  savePresetFailure,
  scanBegin,
  scanFailure,
  scanning,
  scanSuccess,
} from './types';
import { endpoint } from '../../constants';
import { AntivirusState, CheckType, InfectedFile, ScanOption } from './state';
import { getNestedObject } from '../../utils/tools';
import { NotifyBannerTypes, UserNotification } from '../../redux/user-notification.interface';
import { ITranslate } from '../translate.reducers';
import { ScanResultResponse, TaskManagerResponse } from './model';

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
   * Deletes a file or files
   *
   * @param siteId Site's id
   * @param files Files array
   * @param userNotification User notifications provider
   * @param t i18n provider
   */
  export function deleteFiles(siteId: number, files: InfectedFile[], userNotification: UserNotification, t: ITranslate) {
    return async dispatch => {
      try {
        const body = { files: files.map(f => f.id) };
        const requestInit: RequestInit = {
          method: 'DELETE',
          body: JSON.stringify(body),
        };
        const response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/files`, requestInit);
        if (response.status === 404) {
          const filename = files[0].name;
          userNotification.push({
            type: NotifyBannerTypes.ERROR_FAST,
            title: t.msg(['VIRUS_DELETE', 'FAIL']),
            content: t.msg(['VIRUS_DELETE', 'ERROR_404'], { filename }),
          });
        }
        handleErrors(response);
        const json: TaskManagerResponse = await response.json();

        dispatch(deleteFilesSuccess(json));
      } catch (error) {
        dispatch(deleteFilesFailure(error));
      }
    };
  }

  /**
   * File deletion post process method
   * It updated the state of the component and sends the user notification
   * @param notify Notification from notifier
   * @param userNotification User Notification provider
   * @param t Translator provider
   */
  export function deleteFilesPostProcess(notify: { event: NotifierEvent }, userNotification: UserNotification, t: ITranslate) {
    return dispatch => {
      try {
        const results = getNestedObject(notify, ['event', 'additional_data', 'output', 'content', 'result']);
        let deletedFiles: InfectedFile[] = results.filter(file => file.status === 'success');
        let count: number = deletedFiles.length;

        const title =
          count > 1
            ? `${t.msg(['VIRUS_DELETE', 'GROUP', 'DONE_1'], count)} ${count} ${t.msg(['VIRUS_DELETE', 'GROUP', 'DONE_2'], count)}`
            : t.msg(['VIRUS_DELETE', 'DONE']);
        const content = count > 1 ? deletedFiles[0].name : undefined;
        userNotification.push({
          title,
          content,
          type: NotifyBannerTypes.NORMAL_FAST,
        });
        dispatch(deleteFilesPostProcessSuccess(count));
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
