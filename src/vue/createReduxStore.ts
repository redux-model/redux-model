import Vue from 'vue';
import { createReduxStore as coreCreateReduxStore, ReduxStoreConfig } from '../core/utils/createReduxStore';

export const createReduxStore = (config: ReduxStoreConfig) => {
  const store = coreCreateReduxStore(config);

  // Add observer to redux store
  Vue.observable(store.getState());

  return store;
};
