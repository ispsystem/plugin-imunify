import Polyglot from 'node-polyglot';
import { languageTypes, isDevMode, endpoint } from '../constants';
import { Translate } from '../store/types';

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

function msg(polyglot: Polyglot, keys: string[], options?: number | Polyglot.InterpolationOptions): string {
  if (Array.isArray(keys)) {
    return polyglot.t(keys.join('.'), options);
  } else if (typeof keys === 'string') {
    return polyglot.t(keys, options);
  }

  console.warn(keys);
  return '';
}

export async function loadTranslate(lang: languageTypes): Promise<Translate> {
  let json = {};
  if (isDevMode) {
    json = (await import(`../i18n/ru`)).default;
  } else {
    const requestInit: RequestInit = {
      method: 'GET',
    };
    const response = await fetch(`${endpoint}/plugin/imunify/i18n/${lang}.json`, requestInit);
    handleErrors(response);
    json = await response.json();
  }

  const _polyglot = new Polyglot({ phrases: { ...json }, locale: lang });

  return { msg: msg.bind(null, _polyglot), error: null, loading: false };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNestedObject(nestedObj, pathArr): any {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), nestedObj);
}

/**
 * Add leading zeroes to date
 *
 * @param n - day or time number
 */
export function pad(n: number): number | string {
  return n < 10 ? '0' + n : n;
}

/**
 * Method return input date as string in DD.MM.YYYY format
 * If in function passed t(translate obj) then function return today or yesterday if it true
 *
 * @param timestamp - input date in timestamp
 * @param t - translate object
 */
export function getDayMonthYearAsStr(timestamp: number, t?: Translate): string {
  if (t !== undefined && t !== null) {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 864e5;
    if (timestamp > today) {
      return t.msg(['WIDGET', 'COMMON_DATE', 'TODAY']).toLowerCase();
    }
    if (timestamp > yesterday) {
      return t.msg(['WIDGET', 'COMMON_DATE', 'YESTERDAY']).toLowerCase();
    }
  }
  const date = new Date(timestamp);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}
