import { TranslateActionTypes, TRANSLATE_ACTION } from './translate.actions';
import { Lang } from '../i18n/ru';
import { Path } from '../utils/types';

export interface ITranslate {
  msg<T extends Lang, L extends Path<T, L>>(
    params: L
  ): string;
  error: any;
  loading: boolean;
}

const getInitialState = (): ITranslate => {
  return {
    error: null,
    loading: false,
    msg: () => ''
  };
};

export const translateReducer = (state: ITranslate = getInitialState(), action: TranslateActionTypes) => {
  switch (action.type) {
    case TRANSLATE_ACTION.LOAD_I18N_BEGIN: {
      return {
        ...state,
        loading: true,
        error: null
      };
    }

    case TRANSLATE_ACTION.LOAD_I18N_SUCCESS: {
      return {
        ...state,
        loading: false,
        msg: action.payload.data
      };
    }

    case TRANSLATE_ACTION.LOAD_I18N_FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    }
  }

  return state;
};
