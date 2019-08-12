import { AbstractStore, TaskElement } from './abstract.store';
import { endpoint } from '../constants';
import { API } from './api.interface';
import { NotifierEvent, TaskEventName, UserNotification, Translate, NotifyBannerTypes } from './types';
import { getNestedObject } from '../utils/utils';

export class WidgetState {
  infectedFilesCount: number = null;
  partialPresetId: number = null;
  lastCheck: number = null;
  fullPresetId: number = null;
  scanning: boolean = false;
  healing: boolean = false;
  siteId: number = null;
  hasScheduledActions: boolean;
  isProVersion: boolean;
  error: any;

  constructor(siteId: number) {
    this.siteId = siteId;
  }
}

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

export class Store extends AbstractStore<WidgetState> {
  constructor(siteId: number) {
    super(new WidgetState(siteId));
    this.taskList$.subscribe({
      next: list => {
        console.log('NEXT LIST', list);
        // SEARCH LAST ACTIVE
        const lastActiveTask = list.find(
          task => task.status === 'running' && (task.name === TaskEventName.scan || task.name === TaskEventName.cure),
        );
        if (lastActiveTask !== undefined) {
          lastActiveTask.name === TaskEventName.scan
            ? this.setStateProperty({ scanning: true, healing: false })
            : this.setStateProperty({ healing: true, scanning: false });
        } else {
          this.setStateProperty({ healing: false, scanning: false });
        }
      },
    });
  }

  async scan(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'POST',
        body: JSON.stringify({ preset_id: this.state.fullPresetId }),
      };

      let response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/scan`, requestInit);
      handleErrors(response);

      const result: API.ScanResponse = await response.json();

      this.addTask({ id: result.task_id, name: TaskEventName.scan, status: 'running' });
    } catch (error) {
      this.setError(error);
    }
  }

  async getFeature(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      let response = await fetch(`${endpoint}/plugin/api/imunify/feature`, requestInit);
      handleErrors(response);

      let updatesProps: API.GetFeatureResponse = await response.json();
      this.setStateProperty(updatesProps);
    } catch (error) {
      this.setError(error);
    }
  }

  async getPresets(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      let response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/presets`, requestInit);
      handleErrors(response);
      const json: API.GetPresetsResponse = await response.json();

      const updatedProps: Partial<WidgetState> = { fullPresetId: json.full.id };
      if (json.partial !== undefined) {
        updatedProps.partialPresetId = json.partial.id;
      }

      this.setStateProperty(updatedProps);
    } catch (error) {
      this.setError(error);
    }
  }
  async getInfectedFiles(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      let response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/files/infected`, requestInit);
      handleErrors(response);
      const json: API.GetInfectedFilesResponse = await response.json();
      this.setStateProperty({
        infectedFilesCount: json.size,
      });
    } catch (error) {
      this.setError(error);
    }
  }

  async getLastScan(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      let response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/scan/history?limit=1`, requestInit);
      handleErrors(response);
      let json: API.GetLastScanResponse = await response.json();

      this.setStateProperty({
        lastCheck: json.list[0] ? json.list[0].date : null,
      });
    } catch (error) {
      this.setError(error);
    }
  }

  async getScanResult(notify: { event: NotifierEvent }, userNotification: UserNotification, t: Translate): Promise<void> {
    try {
      const started = getNestedObject(notify, ['event', 'additional_data', 'output', 'content', 'scan', 'started']);
      const taskId = notify.event.id;
      console.log('I AM IN GET SCAN RES', started, taskId);
      if (started !== undefined && taskId !== undefined) {
        const [scanResponse, infectedFilesResponse] = await Promise.all([
          fetch(`${endpoint}/plugin/api/imunify/scan/result?task_id=${notify.event.id}&started=${started}`),
          fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/files/infected?limit=0`),
        ]);

        console.log('I AM IFETCH NEW DATA', scanResponse, infectedFilesResponse);
        handleErrors(scanResponse);
        handleErrors(infectedFilesResponse);

        const [scanResult, infectedFilesResult]: [API.GetScanResultResponse, API.GetInfectedFilesResponse] = await Promise.all([
          scanResponse.json(),
          infectedFilesResponse.json(),
        ]);

        console.log('GetScanResultResponse', scanResult);
        console.log('GetInfectedFilesResponse', infectedFilesResult);
        userNotification.push({
          title: t.msg(['WIDGET', 'SCAN_SUCCESS']),
          content: '',
          link: t.msg(['WIDGET', 'MORE_DETAILS']),
          type: NotifyBannerTypes.NORMAL_FAST,
        });
        console.log('NOTIFY PUSHED');

        scanResult.infectedFiles.list.forEach(file => {
          if (file.status === 'INFECTED') {
            userNotification.push({
              title: t.msg(['WIDGET', 'VIRUS_DETECTED']),
              content: file.threatName,
              type: NotifyBannerTypes.ERROR_FAST,
            });
          }
        });
        this.setStateProperty({
          lastCheck: scanResult.historyItem.date,
          infectedFilesCount: infectedFilesResult.size,
        });
        console.log('STATE UPDATED');

        this.removeTask(taskId);
      } else {
        console.warn('Can not found object started or taskId in a notify!');
      }
    } catch (error) {
      this.setError(error);
    }
  }

  setStateProperty(properties: Partial<WidgetState>): void {
    console.warn('BEFORE WIDGET STATE', this.state);
    this.setState({
      ...this.state,
      ...properties,
    });
    console.warn('AFTER WIDGET STATE', this.state);
  }

  addTask(task: TaskElement | TaskElement[]): void {
    console.log('ADD TASK', task);
    const tasks = Array.isArray(task) ? task : [task];
    this.setTaskList(this.taskList.concat(tasks.filter(t => this.taskList.indexOf(t) < 0)));
  }

  removeTask(id: number | number[]): void {
    console.log('REMOVIND TASK', id);

    const ids = Array.isArray(id) ? id : [id];
    this.setTaskList(this.taskList.filter(t => ids.indexOf(t.id) < 0));
  }

  setError(error: any): void {
    this.setState({
      ...this.state,
      error,
    });
  }
}
