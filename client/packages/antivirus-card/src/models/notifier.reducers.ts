import { NOTIFIER_ACTION, NotifierActionTypes } from './notifier.actions';
import { ISPNotifier } from '@ispsystem/notice-tools';

export const notifierReducer = (state: ISPNotifier = null, action: NotifierActionTypes): ISPNotifier => {
  switch (action.type) {
    case NOTIFIER_ACTION.UPDATE_NOTIFIER_SUCCESS: {
      return action.payload.data;
    }
  }

  return state;
};
