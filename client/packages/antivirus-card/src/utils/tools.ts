import { Translate } from '../models/translate.reducers';
import { PricePeriodType } from '../models/antivirus/model';
import { ISPNotifier, ISPNotifierNotifyType } from '@ispsystem/notice-tools';

/**
 * Combination of async function + await + setTimeout
 *
 * @param m - milliseconds
 */
export const sleep = (m: number) => new Promise(r => setTimeout(r, m));

/**
 * Выбор слова в соответствующем падеже для опеределенного числа
 *
 * @param num число для которого необходимо подобрать склонение
 * @param listMsgs список возможных слов для числа, состоит из 3-х элементов: (для единиц, для пар, для других чисел)
 */
export function declOfNum(num: number, listMsgs: string[]): string {
  if (num === 1) {
    return listMsgs[0];
  } else if (num % 100 > 4 && num % 100 < 20) {
    return listMsgs[2];
  } else {
    switch (num % 10) {
      case 1:
        return listMsgs[listMsgs.length > 3 ? 3 : 0];
      case 2:
      case 3:
      case 4:
        return listMsgs[1];
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 0:
        return listMsgs[2];
    }
  }
}

/**
 * Return nested object or undefined
 *
 * @param object - root object
 * @param pathArr - path to nested object as string array
 */
export function getNestedObject(object: object, pathArr: string[]) {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), object);
}

/**
 * Создание уникального идентификатора
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
export function uuidv4() {
  const hash: any = ([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11;
  // https://stackoverflow.com/questions/44042816/what-is-wrong-with-crypto-getrandomvalues-in-internet-explorer-11
  const crypto = window.crypto || window['msCrypto']; // for IE 11
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return hash.replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))![0] & (15 >> (c / 4)))).toString(16));
}

/**
 * Add leading zeroes to date
 *
 * @param n - day or time number
 */
export function pad(n: number) {
  return n < 10 ? '0' + n : n;
}

/**
 * Method for reduce and filter array
 *
 * @param arr - input array
 * @param filter - filter function
 * @param preFun - functions to be performed before filtering
 */
export function reduceFilter<T>(arr: T[], filter: (e: T) => boolean, ...preFun: ((e: T) => T)[]): T[] {
  return arr.reduce((res: T[], e) => {
    if (preFun) {
      e = preFun.reduce((_, f) => {
        return f(e);
      }, e);
    }

    return filter(e) ? res.push(e) && res : res;
  }, []);
}

/**
 * Filter array by empty string
 *
 * @param arr input array
 */
export const filterEmptyString = (arr: string[]): string[] => reduceFilter(arr, (e: string) => e !== '', (e: string) => e.trim());

/**
 * Method return input date as string in DD.MM.YYYY format
 * If in function passed t(translate obj) then function return today or yesterday if it true
 *
 * @param date - input date in date obj
 * @param t - translate object
 */
export function getDayMonthYearAsStr(date: Date, t?: Translate): string {
  if (t !== undefined && t !== null) {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 864e5;
    const inputDate = date.getTime();
    if (inputDate > today) {
      return t.msg(['COMMON_DATE', 'TODAY']).toLowerCase();
    }
    if (inputDate > yesterday) {
      return t.msg(['COMMON_DATE', 'YESTERDAY']).toLowerCase();
    }
  }
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/**
 * Method return input date as string in hh:mm format
 *
 * @param date - input date in date obj
 */
export function getTimeAsStr(date: Date): string {
  return `${date.getHours()}:${pad(date.getMinutes())}`;
}

/**
 * Get currency symbol by ISO
 * @param currency - currency ISO
 */
export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'RUB':
      return '₽';
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    default:
      return currency;
  }
}

/**
 * Return period as short message
 * @param period - period
 * @param t - translate object
 */
export function getShortPeriod(period: PricePeriodType, t: Translate, count = 3): string {
  return t.msg(['PRICE_PERIOD', period.toUpperCase() as 'DAY' | 'MONTH' | 'YEAR']).slice(0, count);
}

/**
 * Property entity types for configureNotifier function
 */
export type NotifierEntityIds = { [x in 'plugin' | 'market_order']?: number[] };

/**
 * Configure/reconfigure notifier object
 *
 * @param notifier - notifier service object
 * @param entityIds - ids for the entity
 */
export function configureNotifier(notifier: ISPNotifier, entityIds: NotifierEntityIds): void {
  if (notifier === undefined || notifier === null) {
    return;
  }
  const params = {
    task_list: true,
    entities: [],
  };

  if (entityIds.plugin !== undefined) {
    params.entities.push({
      entity: 'plugin',
      ids: entityIds['plugin'],
      type: [{ name: ISPNotifierNotifyType.CREATE }, { name: ISPNotifierNotifyType.UPDATE }, { name: ISPNotifierNotifyType.DELETE }],
      relations: [
        {
          entity: 'task',
          type: [{ name: ISPNotifierNotifyType.CREATE }, { name: ISPNotifierNotifyType.UPDATE }, { name: ISPNotifierNotifyType.DELETE }],
        },
      ],
    });
  }

  params.entities.push({
    entity: 'market_order',
    ids: entityIds['market_order'],
    type: [
      { name: ISPNotifierNotifyType.CREATE },
      { name: ISPNotifierNotifyType.UPDATE, action: '/isp/market/v3/order/{market_order_id}' },
      { name: ISPNotifierNotifyType.DELETE },
    ],
  });

  notifier && notifier.setParams(params);
}
