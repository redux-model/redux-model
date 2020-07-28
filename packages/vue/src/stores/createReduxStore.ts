import { ReduxStoreConfig, storeHelper } from '@redux-model/core';
import local from '../storages/localStorage';
import session from '../storages/sessionStorage';

/**
 * The store engine for persist.
 *
 * `local:   Promised localStorage`
 *
 * `session: Promised sessionStorage`
 *
 * `memory:  Promised object for testing`
 */
export const createReduxStore = (config: ReduxStoreConfig<'local' | 'session' | 'memory'> = {}) => {
  const persit = config.persist;

  if (persit) {
    switch (persit.storage) {
      case 'local':
        persit.storage = local;
        break;
      case 'session':
        persit.storage = session;
        break;
    }
  }

  return storeHelper.createStore(config as ReduxStoreConfig);
};
