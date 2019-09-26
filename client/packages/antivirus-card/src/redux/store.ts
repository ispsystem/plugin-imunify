import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import { rootReducer, RootState } from './reducers';
import logger from 'redux-logger';

const middlewares = [thunk];

if (process.env.NODE_ENV === `development`) {
  middlewares.push(logger);
}

const configureStore = (preloadedState: RootState): Store<RootState> =>
  createStore(rootReducer, preloadedState, applyMiddleware(...middlewares));

export { configureStore };
