import { Observable } from 'rxjs';

/** Interface for notify event */
export interface NotifyEvent {
  type: NotifyBannerEvents;
  id: number;
}

/** Enum of notify events on banner*/
export enum NotifyBannerEvents {
  CLOSE = 'close',
  CLICK = 'click',
  HIDE = 'hide',
  LINK_CLICK = 'link-click',
}

/** Enum of banner type */
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

/** Enum of white-space value */
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

/** Enum of link type */
export enum LinkType {
  /** 
solid underline */
  default = 'default',
  /** solid underline on hover */
  // eslint-disable-next-line @typescript-eslint/camelcase
  default_hover = 'default-hover',
  /** dotted underline */
  dropdown = 'dropdown',
  /** dotted underline on hover */
  // eslint-disable-next-line @typescript-eslint/camelcase
  dropdown_hover = 'dropdown-hover',
}

/** Interface of user notification */
export interface UserNotification {
  push(banner: NotifyBanner): Observable<NotifyEvent>;
}
