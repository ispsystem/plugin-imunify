import Polyglot from 'node-polyglot';
import { TranslateActionTypes, TRANSLATE_ACTION } from './translate.actions';

export interface ITranslate {
  polyglot: Polyglot;
  error: any;
  loading: boolean;
}

const getInitialState = (): ITranslate => {
  return {
    error: null,
    loading: false,
    polyglot: null
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
        polyglot: action.payload.data
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
