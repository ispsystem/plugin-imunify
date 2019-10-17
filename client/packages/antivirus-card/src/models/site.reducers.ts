import { SiteActionTypes, SITE_ACTION } from './site.actions';

export const siteIdReducer = (state: number = null, action: SiteActionTypes): number => {
  switch (action.type) {
    case SITE_ACTION.UPDATE_SITE_ID_SUCCESS: {
      return action.payload.data;
    }
  }

  return state;
};
