import {applyMiddleware, compose, createStore} from 'redux';
import createSagaMiddleware from 'redux-saga';
import throttle from 'lodash/throttle';

import {loadState, saveState} from "./localStorage";
import monitorReducerEnhancer from '../enhancers/monitorReducer';
import loggerMiddleware from '../middleware/logger';
import authCheckMiddleware from '../middleware/authCheck';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';


export default function configureStore() {

    const sagaMiddleware = createSagaMiddleware();

    const middlewares = [loggerMiddleware, authCheckMiddleware, sagaMiddleware];
    const middlewareEnhancer = applyMiddleware(...middlewares);

    const enhancers = [middlewareEnhancer, monitorReducerEnhancer];
    const composedEnhancers = compose(...enhancers);

    const persistedState = loadState();

    const store = createStore(rootReducer, persistedState, composedEnhancers);

    if (process.env.NODE_ENV === 'development') {
        console.log(store.getState());
    }

    store.subscribe(
        throttle(() => {
            saveState({
                schemaReducer: store.getState().schemaReducer,
                userReducer: store.getState().userReducer,
                recordTableReducer: store.getState().recordTableReducer,
                queryBuilderReducer: store.getState().queryBuilderReducer,
                navigationReducer: store.getState().navigationReducer
            });
        }, 1000)
    );

    sagaMiddleware.run(rootSaga);

    if (process.env.NODE_ENV !== 'production' && module.hot) {
        module.hot.accept('./rootReducer', () => store.replaceReducer(rootReducer))
    }

    return store;
}
