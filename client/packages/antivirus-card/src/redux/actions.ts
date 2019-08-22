import { TranslateActionTypes } from '../models/translate.actions';
import { AntivirusActionTypes } from '../models/antivirus/types';
import { NotifierActionTypes } from '../models/notifier.actions';

export type ActionTypes = AntivirusActionTypes | TranslateActionTypes | NotifierActionTypes;
