import { ReduxStoreConfig, storeHelper } from '../core';
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
export const createReduxStore = (config: ReduxStoreConfig<'local' | 'session' | 'memory'>) => {
  if (config.persist) {
    switch (config.persist.storage) {
      case 'local':
        config.persist.storage = local;
        break;
      case 'session':
        config.persist.storage = session;
        break;
    }
  }

  return storeHelper.createStore(config as ReduxStoreConfig);
};
