import { AntivirusState, antivirusReducer } from '../models/antivirus.reducers';

import { combineReducers } from 'redux';
import { Observable } from 'rxjs';

export interface INotifier {
  ids: (ids$: number[] | Observable<number[]>) => INotifier;
  create$: () => Observable<any>;
  delete$: () => Observable<any>;
}

// This interface represents app state by nesting feature states.
export interface RootState {
  antivirus: AntivirusState;
  notifier: INotifier;
}

// Combine feature reducers into a single root reducer
export const rootReducer = combineReducers({
  antivirus: antivirusReducer,
  notifier: (state: INotifier = null) => state
});
