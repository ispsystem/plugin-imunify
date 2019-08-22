import { NOTIFIER_ACTION, NotifierActionTypes } from './notifier.actions';
import { Notifier } from '../redux/reducers';

export const notifierReducer = (state: Notifier = null, action: NotifierActionTypes): Notifier => {
  switch (action.type) {
    case NOTIFIER_ACTION.UPDATE_NOTIFIER_SUCCESS: {
      return action.payload.data;
    }
  }

  return state;
};
