import {
  deleteFilesFailure,
  deleteFilesPostProcessFailure,
  deleteFilesPostProcessSuccess,
  deleteFilesSuccess,
  disablePresetFailure,
  disablePresetSuccess,
  getInfectedFilesFailure,
  getInfectedFilesSuccess,
  getPresetsFailure,
  getPresetsSuccess,
  getStateBegin,
  getStateFailure,
  getLastScanSuccess,
  getLastScanFailure,
  getStateSuccess,
  saveAndScanBegin,
  saveAndScanFailure,
  saveAndScanSuccess,
  savePartialPresetSuccess,
  saveFullPresetSuccess,
  savePresetFailure,
  scanBegin,
  scanFailure,
  scanSuccess,
  getPriceListSuccess,
  getPriceListFailure,
  cureFilesSuccess,
  cureFilesFailure,
  cureFilesPostProcessSuccess,
  cureFilesPostProcessFailure,
} from './types';
import { endpoint } from '../../constants';
import { AntivirusState, CheckType, InfectedFile, ScanOption } from './state';
import { getNestedObject } from '../../utils/tools';
import { NotifyBannerTypes, UserNotification } from '../../redux/user-notification.interface';
import { ITranslate } from '../translate.reducers';
import {
  ScanResultResponse,
  TaskManagerResponse,
  GetInfectedFilesResponse,
  ScanSuccessData,
  GetLastScanResponse,
  LastScanData,
  PriceListResponse,
} from './model';
import { ISPNotifierEvent } from '@ispsystem/notice-tools';

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
          if (files.length > 1) {
            const titleLeftPart = t.msg(['VIRUS_DELETE', 'GROUP', 'FAIL_1']);
            const titleRightPart = t.msg(['VIRUS_DELETE', 'GROUP', 'FAIL_2'], files.length);
            userNotification.push({
              type: NotifyBannerTypes.ERROR_FAST,
              title: `${titleLeftPart} ${files.length} ${titleRightPart}`,
              content: undefined,
            });
          } else {
            const filename = files[0].name;
            userNotification.push({
              type: NotifyBannerTypes.ERROR_FAST,
              title: t.msg(['VIRUS_DELETE', 'FAIL']),
              content: t.msg(['VIRUS_DELETE', 'ERROR_404'], { filename }),
            });
          }
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
   * @param notifyEvent Notification from notifier
   * @param userNotification User Notification provider
   * @param t Translator provider
   */
  export function deleteFilesPostProcess(notifyEvent: ISPNotifierEvent, userNotification: UserNotification, t: ITranslate) {
    return dispatch => {
      try {
        const results = getNestedObject(notifyEvent, ['additional_data', 'output', 'content', 'result']);
        const deletedFiles: InfectedFile[] = results.filter(file => file.status === 'success');
        const count: number = deletedFiles.length;

        const type = NotifyBannerTypes.NORMAL_FAST;
        if (count > 1) {
          userNotification.push({
            title: `${t.msg(['VIRUS_DELETE', 'GROUP', 'DONE_1'], count)} ${count} ${t.msg(['VIRUS_DELETE', 'GROUP', 'DONE_2'], count)}`,
            content: undefined,
            type,
          });
        } else {
          userNotification.push({
            title: t.msg(['VIRUS_DELETE', 'DONE']),
            content: deletedFiles[0] && deletedFiles[0].name,
            type,
          });
        }

        dispatch(deleteFilesPostProcessSuccess(count));
      } catch (error) {
        dispatch(deleteFilesPostProcessFailure(error));
      }
    };
  }

  /**
   * Healing a file or files
   *
   * @param siteId Site's id
   * @param files Files array
   * @param userNotification User notifications provider
   * @param t i18n provider
   */
  export function cureFiles(siteId: number, files: InfectedFile[], userNotification: UserNotification, t: ITranslate) {
    return async dispatch => {
      try {
        const body = { files: files.map(f => f.id), action: 'cure' };
        const requestInit: RequestInit = {
          method: 'POST',
          body: JSON.stringify(body),
        };
        const response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/files`, requestInit);
        if (response.status === 404) {
          if (files.length > 1) {
            const titleLeftPart = t.msg(['VIRUS_CURE', 'GROUP', 'FAIL_1']);
            const titleRightPart = t.msg(['VIRUS_CURE', 'GROUP', 'FAIL_2'], files.length);
            userNotification.push({
              type: NotifyBannerTypes.ERROR_FAST,
              title: `${titleLeftPart} ${files.length} ${titleRightPart}`,
              content: undefined,
            });
          } else {
            const filename = files[0].name;
            userNotification.push({
              type: NotifyBannerTypes.ERROR_FAST,
              title: t.msg(['VIRUS_CURE', 'FAIL']),
              content: t.msg(['VIRUS_CURE', 'ERROR_404'], { filename }),
            });
          }
        }
        handleErrors(response);
        const json: TaskManagerResponse = await response.json();

        dispatch(cureFilesSuccess(json));
      } catch (error) {
        dispatch(cureFilesFailure(error));
      }
    };
  }

  /**
   * File curing post process method
   * It updated the state of the component and sends the user notification
   * @param notifierEvent - Notification from notifier
   * @param userNotification - User Notification provider
   * @param t - Translator provider
   */
  export function cureFilesPostProcess(notifierEvent: ISPNotifierEvent, userNotification: UserNotification, t: ITranslate) {
    return dispatch => {
      try {
        const results = getNestedObject(notifierEvent, ['additional_data', 'output', 'content', 'result']);
        const curedFiles: InfectedFile[] = results.filter(file => file.status === 'success');
        const count: number = curedFiles.length;

        const type = NotifyBannerTypes.NORMAL_FAST;
        if (count > 1) {
          userNotification.push({
            title: `${t.msg(['VIRUS_CURE', 'GROUP', 'DONE_1'], count)} ${count} ${t.msg(['VIRUS_CURE', 'GROUP', 'DONE_2'], count)}`,
            content: undefined,
            type,
          });
        } else {
          userNotification.push({
            title: t.msg(['VIRUS_CURE', 'DONE']),
            content: curedFiles[0] && curedFiles[0].name,
            type,
          });
        }

        dispatch(cureFilesPostProcessSuccess(count));
      } catch (error) {
        dispatch(cureFilesPostProcessFailure(error));
      }
    };
  }

  /**
   * Search viruses
   *
   * @param presetId - scan options preset Id
   * @param siteId - vepp site ID
   */
  export function scan(presetId: number, type: CheckType, siteId: number) {
    return async dispatch => {
      dispatch(scanBegin({ type }));
      try {
        const requestInit: RequestInit = {
          method: 'POST',
          body: JSON.stringify({ preset_id: presetId }),
        };

        const response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/scan`, requestInit);
        handleErrors(response);
      } catch (error) {
        dispatch(scanFailure(error));
      }
    };
  }

  /**
   *
   * Get scan result
   *
   * @param notifyEvent - result from notifier
   */
  export function getScanResult(notifyEvent: ISPNotifierEvent, userNotification: UserNotification, t: ITranslate, siteId: number) {
    return async dispatch => {
      try {
        const started = getNestedObject(notifyEvent, ['additional_data', 'output', 'content', 'scan', 'started']);
        const taskId = notifyEvent.id;
        if (started !== undefined && taskId !== undefined) {
          const [scanResponse, infectedFilesCount, presetsResponse] = await Promise.all([
            fetch(`${endpoint}/plugin/api/imunify/scan/result?task_id=${notifyEvent.id}&started=${started}`),
            fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/files/infected?limit=0`),
            fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/presets`),
          ]);
          handleErrors(scanResponse);
          handleErrors(infectedFilesCount);
          handleErrors(presetsResponse);
          const [scanResult, filesResult, presets]: [ScanResultResponse, GetInfectedFilesResponse, any] = await Promise.all([
            scanResponse.json(),
            infectedFilesCount.json(),
            presetsResponse.json(),
          ]);

          // Infected files notification
          const infectedFiles = scanResult.infectedFiles.list.filter(f => f.status === 'INFECTED');
          if (infectedFiles.length > 1) {
            userNotification.push({
              title: t.msg(['VIRUS_GROUP_DETECTED'], infectedFiles.length),
              content: undefined,
              type: NotifyBannerTypes.ERROR_FAST,
            });
          } else if (infectedFiles.length === 1) {
            const file = infectedFiles[0];
            userNotification.push({
              title: t.msg(['VIRUS_DETECTED']),
              content: file.name,
              type: NotifyBannerTypes.ERROR_FAST,
            });
          }

          // Cured files notification
          const curedFiles = scanResult.infectedFiles.list.filter(f => f.status === 'CURED');
          if (curedFiles.length > 0) {
            userNotification.push({
              title: t.msg(['NOTIFY', 'SCAN_SUCCESS']),
              content: t.msg(['NOTIFY', 'DESCRIPTION', 'VIRUSES_CURED'], curedFiles.length),
              // link: this._t.msg(['NOTIFY', 'MORE_DETAILS']),
              type: NotifyBannerTypes.NORMAL_FAST,
            });
          } else {
            userNotification.push({
              title: t.msg(['NOTIFY', 'SCAN_SUCCESS']),
              content: t.msg(['NOTIFY', 'DESCRIPTION', 'NO_VIRUSES']),
              // link: this._t.msg(['NOTIFY', 'MORE_DETAILS']),
              type: NotifyBannerTypes.NORMAL_FAST,
            });
          }

          const result: ScanSuccessData = { ...scanResult, infectedFilesCount: filesResult.size, presets };
          dispatch(scanSuccess(result));
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
        const response = await fetch(`${endpoint}/plugin/api/imunify/feature`, requestInit);
        handleErrors(response);
        const json = await response.json();

        dispatch(getStateSuccess(json));
      } catch (error) {
        dispatch(getStateFailure(error));
      }
    };
  }

  /**
   * Method for getting price list for buy pro version
   */
  export function getPriceList() {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'GET',
        };
        const response = await fetch(`${endpoint}/isp/market/v3/pricelist/plugin/AVP?lang=ru`, requestInit);
        handleErrors(response);
        const priceList: PriceListResponse = await response.json();
        /** @todo in price list only first price in list now */
        dispatch(getPriceListSuccess(priceList.list[0]));
      } catch (error) {
        dispatch(getPriceListFailure(error));
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
        const response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/preset`, requestInit);

        handleErrors(response);

        const json: { preset_id: number } = await response.json();

        if (scanType === 'PARTIAL') {
          dispatch(savePartialPresetSuccess({ ...preset, id: json.preset_id }));
        } else if (scanType === 'FULL') {
          dispatch(saveFullPresetSuccess({ ...preset, id: json.preset_id }));
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
          await scan(presetId, scanType, siteId)(dispatch);
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
  export function getLastScan(siteId: number) {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'GET',
        };
        const [full, partial] = await Promise.all([
          fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/scan/history?limit=1&type=FULL`, requestInit),
          fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/scan/history?limit=1&type=PARTIAL`, requestInit),
        ]);
        handleErrors(full);
        handleErrors(partial);
        const lastFull: GetLastScanResponse = await full.json();
        const lastPartial: GetLastScanResponse = await partial.json();
        const result: LastScanData = {
          full: lastFull.list.length > 0 ? lastFull.list[0] : null,
          partial: lastPartial.list.length > 0 ? lastPartial.list[0] : null,
          size: lastFull.size,
        };
        dispatch(getLastScanSuccess(result));
      } catch (error) {
        dispatch(getLastScanFailure(error));
      }
    };
  }

  /**
   * Get list infected files
   *
   * @param siteId - site ID from vepp
   */
  export function getInfectedFiles(siteId: number) {
    return async dispatch => {
      try {
        const requestInit: RequestInit = {
          method: 'GET',
        };
        const response = await fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/files/infected?limit=0`, requestInit);
        handleErrors(response);
        const json = await response.json();

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
        const [customPresets, defaultPreset] = await Promise.all([
          fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/presets`, requestInit),
          fetch(`${endpoint}/plugin/api/imunify/site/${siteId}/presets/default`, requestInit),
        ]);
        handleErrors(customPresets);
        handleErrors(defaultPreset);
        const [presetsResult, defaultResult] = await Promise.all([customPresets.json(), defaultPreset.json()]);
        dispatch(getPresetsSuccess({ ...presetsResult, default: defaultResult }));
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
        const response = await fetch(`${endpoint}/plugin/api/imunify/preset/${presetId}/status`, requestInit);
        handleErrors(response);
        const json = await response.json();

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
