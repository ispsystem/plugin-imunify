import { TranslateActionTypes, TRANSLATE_ACTION } from './translate.actions';
import { Lang } from '../i18n/ru';
import { Translang } from '@ispsystem/translang';
import { languageTypes } from '../constants';

export interface Translate extends Translang<Lang, languageTypes> {
  error: any;
  loading: boolean;
}

const getInitialState = (): Translate => {
  return {
    error: null,
    loading: false,
    lang: null,
    msg: () => '',
  };
};

export const translateReducer = (state: Translate = getInitialState(), action: TranslateActionTypes): Translate => {
  switch (action.type) {
    case TRANSLATE_ACTION.LOAD_I18N_BEGIN: {
      return {
        ...state,
        loading: true,
        error: null,
      };
    }

    case TRANSLATE_ACTION.LOAD_I18N_SUCCESS: {
      return {
        ...state,
        loading: false,
        msg: action.payload.data,
      };
    }

    case TRANSLATE_ACTION.LOAD_I18N_FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    }
  }

  return state;
};
