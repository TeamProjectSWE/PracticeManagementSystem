import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import rootReducer, {rootSaga} from './modules';
import {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import {Provider} from "react-redux";
import 'bootstrap/dist/css/bootstrap.css';

const sagaMiddleware = createSagaMiddleware()
const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(sagaMiddleware)),
)
sagaMiddleware.run(rootSaga);

ReactDOM.render(
    <Provider store={store}>
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    </Provider>,
    document.getElementById('root')
);