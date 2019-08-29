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

/** Antivirus task event names */
export enum TaskEventName {
  scanFull = 'scan-full',
  scanPartial = 'scan-partial',
  cure = 'files-cure',
}

/** Types for inspected files status */
export type InfectedStatusType = 'INFECTED' | 'CURED' | 'EXCEPTED' | 'HEALING' | 'DELETED';

/**
 * Infected file
 */
export interface InfectedFile {
  id: number;
  // file name, e.g. "beregovoi_orcestr.bat"
  name: string;
  // file status, e.g. "заражён"
  status: InfectedStatusType;
  // type of threat, e.g. "Troyan.enspect"
  threatName: string;
  // path to file
  path: string;
  // date and time when the file was detected (timestamp)
  detectionDate: number;
  // date and time when the file was created (timestamp)
  createdDate: number;
  // date and time when the file was changed (timestamp)
  lastChangeDate?: number;
}
