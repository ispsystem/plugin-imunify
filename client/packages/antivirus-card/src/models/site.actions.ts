/** Site actions */
export enum SITE_ACTION {
  UPDATE_SITE_ID_SUCCESS = 'UPDATE_SITE_ID_SUCCESS',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateSiteIdSuccess = data => async (dispatch: (obj: UpdateSiteIdSuccessAction) => any) => {
  return dispatch({
    type: SITE_ACTION.UPDATE_SITE_ID_SUCCESS,
    payload: { data },
  });
};

interface UpdateSiteIdSuccessAction {
  type: SITE_ACTION.UPDATE_SITE_ID_SUCCESS;
  payload: { data: number };
}
export type SiteActionTypes = UpdateSiteIdSuccessAction;

/**
 *
 *
 * SiteActions
 */
export namespace SiteActions {
  /**
   * Update site id state
   *
   * @param state - new site id
   */
  export function updateSiteId(state: number) {
    return dispatch => {
      dispatch(updateSiteIdSuccess(state));
    };
  }
}
