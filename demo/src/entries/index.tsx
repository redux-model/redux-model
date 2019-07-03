import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import { rootReducers } from './reducers';
import { rootMiddleWares } from './middleware';
import App from '../components/App';

const store = createStore(
  rootReducers,
  compose(applyMiddleware(...rootMiddleWares)),
);

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
