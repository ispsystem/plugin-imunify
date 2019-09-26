import { languageTypes, isDevMode, endpoint } from '../constants';
import { Lang } from '../i18n/ru';
import { Translang, translang } from '@ispsystem/translang';

export interface Translate extends Translang<Lang, languageTypes> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  loading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleErrors(response): any {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const contentType = response.headers.get('content-type');

  if (contentType === undefined || !contentType.includes('application/json')) {
    throw new TypeError("Oops, we haven't got JSON with a plugin service list!");
  }

  return response;
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

  return { ...translang(lang, { ...json }), error: null, loading: false };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNestedObject(nestedObj, pathArr): any {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), nestedObj);
}
