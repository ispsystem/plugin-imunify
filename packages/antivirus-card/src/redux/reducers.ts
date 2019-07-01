import { AntivirusState, antivirusReducer } from '../models/antivirus.reducers';

import { combineReducers } from 'redux';



// This interface represents app state by nesting feature states.
export interface RootState {
  antivirus: AntivirusState;
}


// Combine feature reducers into a single root reducer
export const rootReducer = combineReducers({
  antivirus: antivirusReducer
});
