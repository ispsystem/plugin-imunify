import { Observable } from 'rxjs';

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
