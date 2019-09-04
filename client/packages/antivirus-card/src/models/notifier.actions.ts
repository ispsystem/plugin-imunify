import { ISPNotifier } from '@ispsystem/notice-tools';

export enum NOTIFIER_ACTION {
  UPDATE_NOTIFIER_SUCCESS = 'UPDATE_NOTIFIER_SUCCESS',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateNotifierSuccess = data => async (dispatch: (obj: UpdateNotifierSuccessAction) => any) => {
  return dispatch({
    type: NOTIFIER_ACTION.UPDATE_NOTIFIER_SUCCESS,
    payload: { data },
  });
};

interface UpdateNotifierSuccessAction {
  type: NOTIFIER_ACTION.UPDATE_NOTIFIER_SUCCESS;
  payload: { data: ISPNotifier };
}
export type NotifierActionTypes = UpdateNotifierSuccessAction;

/**
 *
 *
 * NotifierActions
 */
export namespace NotifierActions {
  /**
   * Update notifier state
   *
   * @param state - new state
   */
  export function updateNotifier(state: ISPNotifier) {
    return dispatch => {
      dispatch(updateNotifierSuccess(state));
    };
  }
}
