import Polyglot from 'node-polyglot';
import { Lang } from '../i18n/ru';
import { Path } from '../utils/types';
import { Observable } from 'rxjs';

export interface Translate {
  msg<T extends Lang, L extends Path<T, L>>(params: L, options?: number | Polyglot.InterpolationOptions): string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  loading: boolean;
}

/** @todo: move to common plugin lib */
export interface Notifier {
  ids: (ids$: number[] | Observable<number[]>) => Notifier;
  create$: (action?: string) => Observable<any>;
  delete$: (action?: string) => Observable<any>;
  taskList$: () => Observable<any>;
}

export type TaskStatus = 'created' | 'deferred' | 'running' | 'failed' | 'complete';

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
    status: string; // статус задачи
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

/** интерфейс события нотификации */
export interface NotifyEvent {
  type: NotifyBannerEvents;
  id: number;
}

/** Возможные события на уведомлениях */
export enum NotifyBannerEvents {
  CLOSE = 'close',
  CLICK = 'click',
  HIDE = 'hide',
  LINK_CLICK = 'link-click',
}

/** типы банеров для уведомлений */
export enum NotifyBannerTypes {
  ERROR_FAST = 'error-fast',
  NORMAL_FAST = 'normal-fast',
  REST_FAST = 'rest-fast',
  ERROR_LIST = 'error-list',
  NORMAL_LIST = 'normal-list',
  REST_LIST = 'rest-list',
}

/** интерфейс баннера  */
export interface NotifyBanner {
  type: NotifyBannerTypes;
  title: string;
  content: string;
  time?: string;
  link?: string;
  id?: number;
  timer?: NodeJS.Timer;
  linkType?: LinkType;
  isTitleNoWrap?: boolean;
  isContentNoWrap?: boolean;
  isLinkNoWrap?: boolean;
  titleWhiteSpace?: WhiteSpaceValue;
  contentWhiteSpace?: WhiteSpaceValue;
  linkWhiteSpace?: WhiteSpaceValue;
}

/** Перечисление возможных значений white-space */
export enum WhiteSpaceValue {
  normal = 'normal',
  nowrap = 'nowrap',
  pre = 'pre',
  prewrap = 'pre-wrap',
  preline = 'pre-line',
  breakspaces = 'break-spaces',
  inherit = 'inherit',
  initial = 'initial',
  unset = 'unset',
}

/** перечисление типов ссылок */
export enum LinkType {
  /** сплошное подчеркивание */
  default = 'default',
  /** сплошное подчеркивание при наведении */
  // eslint-disable-next-line @typescript-eslint/camelcase
  default_hover = 'default-hover',
  /** пунктирное подчеркивание */
  dropdown = 'dropdown',
  /** пунктирное подчеркивание при наведении */
  // eslint-disable-next-line @typescript-eslint/camelcase
  dropdown_hover = 'dropdown-hover',
}

export interface UserNotification {
  push(banner: NotifyBanner): Observable<NotifyEvent>;
}

/**
 * Presets type
 */
export type CheckType = 'FULL' | 'PARTIAL';

/**
 * Type for scanning intensity
 */
export type IntensityType = 'LOW' | 'MEDIUM' | 'HIGH';

/** Type for file check */
export type CheckFileType = 'critical' | 'all' | 'except_media';

/**
 * Scan option list item
 */
export interface Preset {
  id: number;
  path: string[];
  docroot: string;
  checkMask: string[];
  excludeMask: string[];
  intensity: IntensityType;
  scheduleTime: {
    daily?: {
      hour: number;
      minutes: number;
    };
    single?: {
      date: number;
    };
    weekly?: {
      day: number;
      time: {
        hour: number;
        minutes: number;
      };
    };
    monthly?: {
      day: number;
      time: {
        hour: number;
        minutes: number;
      };
    };
  };
  checkFileTypes: CheckFileType;
  saveCopyFilesDay: number;
  cureFoundFiles: boolean;
  removeInfectedFileContent: boolean;
  checkDomainReputation: boolean;
  email: string;
  parallelChecks: number;
  ramForCheck: number;
  fullLogDetails: boolean;
  maxScanTime: number;
  autoUpdate: boolean;
  isActive: boolean;
}

/**
 * History list item
 */
export interface HistoryItem {
  // verification date and time (timestamp)
  date: number;
  // check type
  checkType: CheckType;
  // count infected files
  infectedFilesCount: number;
  // count cured files
  curedFilesCount: number;
  // scan options preset ID
  scanOptionId: number;
}

export enum TaskEventName {
  scan = 'scan',
  cure = 'cure',
}
