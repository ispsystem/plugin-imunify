import { combineReducers } from 'redux';
import { Observable } from 'rxjs';

import { translateReducer, ITranslate } from '../models/translate.reducers';
import { AntivirusState } from '../models/antivirus/state';
import { antivirusReducer } from '../models/antivirus/reducers';
import { UserNotification } from './user-notification.interface';
import { TaskEventName } from '../models/antivirus/model';
import { notifierReducer } from '../models/notifier.reducers';

/** @todo: move to common plugin lib */
export interface NotifierEvent {
  entity: string; // название сущности
  id: number; // id сущности
  path: string; // путь до сущности (например host/1/image/1 или host/1)
  type: 'create' | 'update' | 'delete'; // тип нотификации
  relations: {
    [entity: string]: number; // объект, где ключ - название сущности, значение - id (формируется из поля `path`)
  };
  data?: any; // данные полученные из хендлера для типа, если он был указан
  // если нотификация по задаче (сущность 'task')
  additional_data?: {
    id?: number; // id задачи
    output?: any;
    name: TaskEventName; // название задачи
    status: 'created' | 'deferred' | 'running' | 'failed' | 'complete'; // статус задачи
    // прогресс задачи, такой формат вроде как формализован на BE но может быть что угодно
    progress?:
      | {
          state?: string; // состояние
          params?: {
            [key: string]: any;
          } | null; // параметры
        }
      | any;
    deferred_reason?: string; // причина, по которой задача отложена (если статус deferred)
  };
}

/**
 * ID сущности
 */
export type ISPNotifierEntityID = number | '*';
/**
 * Путь
 */
export type NotifierPath = (string | ISPNotifierEntityID | ISPNotifierNotifyType)[];

/**
 * Notifier event type
 */
export enum ISPNotifierNotifyType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

/** @todo: move to common plugin lib */
export interface Notifier {
  getTaskList(...path: NotifierPath): Observable<NotifierEvent[]>;
  getEvents(...path: NotifierPath): Observable<NotifierEvent>;
  setParams(params: NotifierParams): void;
}

/**
 * Notifier params
 */
export interface NotifierParams {
  last_notify?: number;
  /**
   * При этом флаге, после отправки параметро придет список активных задач, для сущностей в запросе
   */
  task_list?: boolean;
  entities: NotifierEntityParams[];
}

/**
 * Notifier params
 */
export interface NotifierEntityParams {
  entity: string;
  ids?: number[];
  type: {
    name: ISPNotifierNotifyType;
    action?: string;
  }[];
  relations?: NotifierEntityParams[];
}

// This interface represents app state by nesting feature states.
export interface RootState {
  pluginId: number;
  siteId: number;
  antivirus?: AntivirusState;
  notifier: Notifier;
  userNotification: UserNotification;
  translate?: ITranslate;
}

// Combine feature reducers into a single root reducer
export const rootReducer = combineReducers({
  pluginId: (state: number = null) => state,
  siteId: (state: number = null) => state,
  antivirus: antivirusReducer,
  notifier: notifierReducer,
  translate: translateReducer,
  userNotification: (state: UserNotification = null) => state,
});
