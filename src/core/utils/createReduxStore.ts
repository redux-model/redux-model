import { createStore, Store, StoreCreator } from 'redux';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';

let store: Store;

export const createReduxStore: StoreCreator = (...args: any[]) => {
  // @ts-ignore
  store = createStore(...args);

  return store;
};

export const getStore = () => {
  if (!store) {
    throw new StoreNotFoundError();
  }

  return store;
};
