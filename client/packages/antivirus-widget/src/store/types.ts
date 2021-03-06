import { Lang } from '../i18n/ru';
import { Observable } from 'rxjs';
import { Translang } from '@ispsystem/translang';
import { languageTypes } from '../constants';

export interface Translate extends Translang<Lang, languageTypes> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  loading: boolean;
}

/** Notification Event Interface */
export interface NotifyEvent {
  type: NotifyBannerEvents;
  id: number;
}

/** Possible events on notifications */
export enum NotifyBannerEvents {
  CLOSE = 'close',
  CLICK = 'click',
  HIDE = 'hide',
  LINK_CLICK = 'link-click',
}

/** Types of banners for notifications */
export enum NotifyBannerTypes {
  ERROR_FAST = 'error-fast',
  NORMAL_FAST = 'normal-fast',
  REST_FAST = 'rest-fast',
  ERROR_LIST = 'error-list',
  NORMAL_LIST = 'normal-list',
  REST_LIST = 'rest-list',
}

/** Banner interface  */
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

/** Listing possible values for white-space */
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

/** Enumerating Link Types */
export enum LinkType {
  /** solid underline */
  default = 'default',
  /** solid underline on hover */
  default_hover = 'default-hover', // eslint-disable-line @typescript-eslint/camelcase
  /** dotted underline */
  dropdown = 'dropdown',
  /** dotted underline on hover */
  dropdown_hover = 'dropdown-hover', // eslint-disable-line @typescript-eslint/camelcase
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
