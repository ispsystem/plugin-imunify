import { AbstractStore } from './abstract.store';
import { endpoint } from '../constants';
import { API } from './api.interface';
import { NotifierEvent, UserNotification, Translate, NotifyBannerTypes, TaskEventName, InfectedFile } from './types';
import { getNestedObject, handleErrors } from '../utils/utils';

/** State for antivirus widget component */
export class WidgetState {
  /** Count of infected files */
  infectedFilesCount: number = null;

  /** Partial preset id for scanning */
  partialPresetId: number = null;

  /** Last scan date in timestamp */
  lastCheck: number = null;

  /** Full preset id for scanning */
  fullPresetId: number = null;

  /** Scanning state */
  scanning: boolean = false;

  /** Healing state */
  healing: boolean = false;

  /** Vepp site id */
  siteId: number = null;

  /** Backend can working with scheduled actions */
  hasScheduledActions: boolean;

  /** Flag for imunify pro version */
  isProVersion: boolean;

  /** Error state */
  error: any;

  constructor(siteId: number) {
    this.siteId = siteId;
  }
}

/**
 * Store for antivirus widget component
 */
export class Store extends AbstractStore<WidgetState> {
  /** Global translate */
  private _t: Translate;

  set t(value: Translate) {
    this._t = value;
  }

  /** Global user notification service */
  private _userNotification: UserNotification;

  constructor(siteId: number, userNotification: UserNotification) {
    super(new WidgetState(siteId));
    this._userNotification = userNotification;
  }

  /**
   * Scan action
   */
  async scan(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'POST',
        body: JSON.stringify({ preset_id: this.state.fullPresetId }),
      };

      const response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/scan`, requestInit);
      handleErrors(response);

      // set scanning is true because notification about scanning start may be late
      this.setStateProperty({
        scanning: true,
      });
    } catch (error) {
      this.setError(error);
    }
  }

  /**
   * Sends the request to cure all the infected files
   */
  async cure(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'POST',
        body: JSON.stringify({ files: [], action: 'cure' }),
      };
      const response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/files`, requestInit);
      handleErrors(response);

      this.setStateProperty({
        healing: true,
      });
    } catch (err) {
      this.setError(err);
    }
  }

  /**
   * Action for get feature
   */
  async getFeature(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      const response = await fetch(`${endpoint}/plugin/api/imunify/feature`, requestInit);
      handleErrors(response);

      const updatesProps: API.GetFeatureResponse = await response.json();
      this.setStateProperty(updatesProps);
    } catch (error) {
      this.setError(error);
    }
  }

  /**
   * Action for get presets of scanning
   */
  async getPresets(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      const response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/presets`, requestInit);
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

  /**
   * Action for get infected file list
   */
  async getInfectedFiles(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      const response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/files/infected`, requestInit);
      handleErrors(response);
      const json: API.GetInfectedFilesResponse = await response.json();
      this.setStateProperty({
        infectedFilesCount: json.size,
      });
    } catch (error) {
      this.setError(error);
    }
  }

  /**
   * Action for get last scan
   */
  async getLastScan(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      const response = await fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/scan/history?limit=1`, requestInit);
      handleErrors(response);
      const json: API.GetLastScanResponse = await response.json();

      this.setStateProperty({
        lastCheck: json.list[0] ? json.list[0].date : null,
      });
    } catch (error) {
      this.setError(error);
    }
  }

  /**
   * Action for get scan result
   *
   * @param event - event by notifier
   */
  async getScanResult(event: NotifierEvent): Promise<void> {
    try {
      const started = getNestedObject(event, ['additional_data', 'output', 'content', 'scan', 'started']);
      const taskId = event.id;
      if (started !== undefined && taskId !== undefined) {
        const [scanResponse, infectedFilesResponse] = await Promise.all([
          fetch(`${endpoint}/plugin/api/imunify/scan/result?task_id=${event.id}&started=${started}`),
          fetch(`${endpoint}/plugin/api/imunify/site/${this.state.siteId}/files/infected?limit=0`),
        ]);

        handleErrors(scanResponse);
        handleErrors(infectedFilesResponse);

        const [scanResult, infectedFilesResult]: [API.GetScanResultResponse, API.GetInfectedFilesResponse] = await Promise.all([
          scanResponse.json(),
          infectedFilesResponse.json(),
        ]);

        this._userNotification.push({
          title: this._t.msg(['WIDGET', 'SCAN_SUCCESS']),
          content: '',
          // link: this._t.msg(['WIDGET', 'MORE_DETAILS']),
          type: NotifyBannerTypes.NORMAL_FAST,
        });

        scanResult.infectedFiles.list.forEach(file => {
          if (file.status === 'INFECTED') {
            this._userNotification.push({
              title: this._t.msg(['WIDGET', 'VIRUS_DETECTED']),
              content: file.threatName,
              type: NotifyBannerTypes.ERROR_FAST,
            });
          }
        });
        this.setStateProperty({
          lastCheck: scanResult.historyItem.date,
          infectedFilesCount: infectedFilesResult.size,
          scanning: false,
        });
      } else {
        throw new Error('Can not found object started or taskId in a notify!');
      }
    } catch (error) {
      this.setError(error);
    }
  }

  /**
   * Method for update state by incoming notification
   *
   * @param event - event by notifier
   */
  async updateStateByNotify(event: NotifierEvent): Promise<void> {
    switch (event.additional_data.name) {
      case TaskEventName.scan:
        switch (event.additional_data.status) {
          case 'complete':
            await this.getScanResult(event);
            break;
          case 'running':
            this.setStateProperty({
              scanning: true,
            });
            break;
        }
        break;
      case TaskEventName.cure:
        switch (event.additional_data.status) {
          case 'complete': {
            this.handleCureSuccess(event);
            break;
          }
          case 'running':
            this.setStateProperty({
              healing: true,
            });
            break;
        }
        break;
    }
  }

  /**
   * Handler for cure success
   *
   * @param event - notification event about cure complete
   */
  handleCureSuccess(event: NotifierEvent): void {
    const results = getNestedObject(event, ['additional_data', 'output', 'content', 'result']);
    const curedFiles: InfectedFile[] = results.filter(file => file.status === 'success');
    const count = curedFiles.length;
    const type = NotifyBannerTypes.NORMAL_FAST;
    if (count > 1) {
      this._userNotification.push({
        title: `${this._t.msg(['WIDGET', 'VIRUS_CURE', 'GROUP', 'DONE_1'], count)} ${count} ${this._t.msg(
          ['WIDGET', 'VIRUS_CURE', 'GROUP', 'DONE_2'],
          count,
        )}`,
        content: undefined,
        type,
      });
    } else {
      this._userNotification.push({
        title: this._t.msg(['WIDGET', 'VIRUS_CURE', 'DONE']),
        content: curedFiles[0] && curedFiles[0].name,
        type,
      });
    }
    this.setStateProperty({
      infectedFilesCount: this.state.infectedFilesCount - count > -1 ? this.state.infectedFilesCount - count : 0,
      healing: false,
    });
  }

  /**
   * Method for update state properties
   *
   * @param properties - new properties
   */
  setStateProperty(properties: Partial<WidgetState>): void {
    console.warn('BEFORE WIDGET STATE', this.state);
    this.setState({
      ...this.state,
      ...properties,
    });
    console.warn('AFTER WIDGET STATE', this.state);
  }

  /**
   * Method for set error state
   *
   * @param error - error value
   */
  setError(error: any): void {
    this.setState({
      ...this.state,
      error,
    });
  }
}
