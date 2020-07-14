import { ReduxStoreConfig, storeHelper } from '../core';
import taro from '../storages/taroStorage';

/**
 * The store engine for persist.
 *
 * `taro: shortcut of Taro.getStorage`
 *
 * `memory:  Promised object for testing`
 */
export const createReduxStore = (config: ReduxStoreConfig<'taro' | 'memory'>) => {
  if (config.persist && config.persist.storage === 'taro') {
    config.persist.storage = taro;
  }

  return storeHelper.createStore(config as ReduxStoreConfig);
};
