import { endpoint, languageTypes, isDevMode } from '../constants';
import { translang } from '@ispsystem/translang';

export enum TRANSLATE_ACTION {
  LOAD_I18N_BEGIN = 'LOAD_I18N_BEGIN',
  LOAD_I18N_SUCCESS = 'LOAD_I18N_SUCCESS',
  LOAD_I18N_FAILURE = 'LOAD_I18N_FAILURE',
}

interface LoadBeginAction {
  type: TRANSLATE_ACTION.LOAD_I18N_BEGIN;
}

interface LoadSuccessAction {
  type: TRANSLATE_ACTION.LOAD_I18N_SUCCESS;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

interface LoadFailureAction {
  type: TRANSLATE_ACTION.LOAD_I18N_FAILURE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadBegin = () => async (dispatch: (obj: LoadBeginAction) => any) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_BEGIN,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadSuccess = data => async (dispatch: (obj: LoadSuccessAction) => any) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_SUCCESS,
    payload: { data },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadFailure = error => async (dispatch: (obj: LoadFailureAction) => any) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_FAILURE,
    payload: { error },
  });
};

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

export namespace TranslateActions {
  export function load(lang: languageTypes) {
    return async dispatch => {
      dispatch(loadBegin());
      try {
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

        dispatch(loadSuccess(translang(lang, { ...json }).msg));
        return json;
      } catch (error) {
        dispatch(loadFailure(error));
      }
    };
  }
}

export type TranslateActionTypes = LoadBeginAction | LoadSuccessAction | LoadFailureAction;
