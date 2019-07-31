import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { rootReducer, RootState } from './reducers';

const configureStore = (preloadedState: RootState): Store<RootState> =>
  createStore(rootReducer, preloadedState, applyMiddleware(thunk, logger));

export { configureStore };
