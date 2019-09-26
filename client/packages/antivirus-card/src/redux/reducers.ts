import { combineReducers } from 'redux';
import { ISPNotifier } from '@ispsystem/notice-tools';

import { translateReducer, Translate } from '../models/translate.reducers';
import { AntivirusState } from '../models/antivirus/state';
import { antivirusReducer } from '../models/antivirus/reducers';
import { UserNotification } from './user-notification.interface';
import { notifierReducer } from '../models/notifier.reducers';

// This interface represents app state by nesting feature states.
export interface RootState {
  pluginId: number;
  siteId: number;
  antivirus?: AntivirusState;
  notifier: ISPNotifier;
  userNotification: UserNotification;
  translate?: Translate;
}

// Combine feature reducers into a single root reducer
export const rootReducer = combineReducers({
  pluginId: (state: number = null) => state,
  siteId: (state: number = null) => state,
  antivirus: antivirusReducer,
  notifier: notifierReducer,
  translate: translateReducer,
  userNotification: (state: UserNotification = null) => state,
});
