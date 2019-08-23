import { createStore, Store, StoreCreator } from 'redux';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';

let store: Store;

let listeners: Array<() => void> = [];

export const createReduxStore: StoreCreator = (...args: Parameters<StoreCreator>) => {
  if (!store) {
    store = createStore(...args);
    listeners.forEach((listener) => listener());
    listeners = [];
  }

  return store;
};

export const getStore = () => {
  if (!store) {
    throw new StoreNotFoundError();
  }

  return store;
};

export const onStoreCreated = (fn: () => void): void => {
  if (store) {
    fn();
  } else {
    listeners.push(fn);
  }
};
