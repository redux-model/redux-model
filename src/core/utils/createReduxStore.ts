import { createStore, Store, StoreCreator } from 'redux';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';

let store: Store;

let listeners: Array<(store: Store) => void> = [];

export const createReduxStore: StoreCreator = (...args: Parameters<StoreCreator>) => {
  if (!store) {
    store = createStore(...args);
    listeners.forEach((listener) => listener(store));
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

export const onStoreCreated = (fn: (store: Store) => void): void => {
  if (store) {
    fn(store);
  } else {
    listeners.push(fn);
  }
};
