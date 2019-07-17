import Polyglot from 'node-polyglot';
import { languageTypes, isDevMode, endpoint } from '../constants';
import { Lang } from '../i18n/ru';
import { Path } from './types';

export interface ITranslate {
  msg<T extends Lang, L extends Path<T, L>>(params: L, options?: number | Polyglot.InterpolationOptions): string;
  error: any;
  loading: boolean;
}

export async function loadTranslate(lang: languageTypes): Promise<ITranslate> {
  let json = {};
  if (isDevMode) {
    json = (await import(`../i18n/ru`)).default;
  } else {
    const requestInit: RequestInit = {
      method: 'GET'
    };
    let response = await fetch(`${endpoint}/plugin/imunify/i18n/${lang}.json`, requestInit);
    handleErrors(response);
    json = await response.json();
  }

  const _polyglot = new Polyglot({ phrases: { ...json }, locale: lang });

  return { msg: msg.bind(null, _polyglot), error: null, loading: false };
}

export function getNestedObject(nestedObj, pathArr) {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), nestedObj);
}

function msg(polyglot: Polyglot, keys: string[], options?: number | Polyglot.InterpolationOptions) {
  if (Array.isArray(keys)) {
    return polyglot.t(keys.join('.'), options);
  } else if (typeof keys === 'string') {
    return polyglot.t(keys, options);
  }

  console.warn(keys);
  return '';
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const contentType = response.headers.get('content-type');

  if (contentType === undefined || !contentType.includes('application/json')) {
    throw new TypeError("Oops, we haven't got JSON with a plugin service list!");
  }

  return response;
}
