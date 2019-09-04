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
  payload: any;
}

interface LoadFailureAction {
  type: TRANSLATE_ACTION.LOAD_I18N_FAILURE;
  payload: any;
}

export const loadBegin = () => async (dispatch: (obj: LoadBeginAction) => any, _getState) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_BEGIN,
  });
};

export const loadSuccess = data => async (dispatch: (obj: LoadSuccessAction) => any, _getState) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_SUCCESS,
    payload: { data },
  });
};

export const loadFailure = error => async (dispatch: (obj: LoadFailureAction) => any, _getState) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_FAILURE,
    payload: { error },
  });
};

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
