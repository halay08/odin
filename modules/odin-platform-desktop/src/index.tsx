import React from 'react';
import {render} from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import 'antd/dist/antd.css';
import * as serviceWorker from './serviceWorker';
import App from './App';
import configureStore from './store/configureStore';


const store = configureStore();

const renderApp = () => render(
        <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
        </React.StrictMode>,
        document.getElementById('root')
    );
// @ts-ignore
if (process.env.NODE_ENV !== 'production' && module.hot) {
    // @ts-ignore
    module.hot.accept('./App', renderApp)
}

renderApp();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
