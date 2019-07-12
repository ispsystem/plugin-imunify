import Polyglot from 'node-polyglot';
import { endpoint, languageTypes } from '../constants';

export namespace TranslateActions {
  export function load(lang: languageTypes) {
    return async dispatch => {
      dispatch(loadBegin());

      try {
        const requestInit: RequestInit = {
          method: 'GET'
        };
        let response = await fetch(`${endpoint}/plugin/imunify/i18n/${lang}.json`, requestInit);
        handleErrors(response);
        let json = await response.json();

        dispatch(loadSuccess(new Polyglot({ phrases: { ...json }, locale: lang })));
        return json;
      } catch (error) {
        dispatch(loadFailure(error));
      }
    };
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
}

export enum TRANSLATE_ACTION {
  LOAD_I18N_BEGIN = 'LOAD_I18N_BEGIN',
  LOAD_I18N_SUCCESS = 'LOAD_I18N_SUCCESS',
  LOAD_I18N_FAILURE = 'LOAD_I18N_FAILURE'
}

export const loadBegin = () => async (dispatch: (obj: LoadBeginAction) => any, _getState) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_BEGIN
  });
};

export const loadSuccess = data => async (dispatch: (obj: LoadSuccessAction) => any, _getState) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_SUCCESS,
    payload: { data }
  });
};

export const loadFailure = error => async (dispatch: (obj: LoadFailureAction) => any, _getState) => {
  return dispatch({
    type: TRANSLATE_ACTION.LOAD_I18N_FAILURE,
    payload: { error }
  });
};

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

export type TranslateActionTypes = LoadBeginAction | LoadSuccessAction | LoadFailureAction;
