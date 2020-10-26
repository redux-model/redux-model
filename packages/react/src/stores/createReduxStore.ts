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
 *
 * For React-Native, you have to install `@react-native-community/async-storage` or implement PersistStorage yourself.
 * ```javascript
 * import AsyncStorage from '@react-native-community/async-storage';
 *
 * const store = createReduxStore({
 *   ...
 *   persist: {
 *     storage: AsyncStorage,
 *     ...
 *   }
 * });
 * ```
 */
export const createReduxStore = (config: ReduxStoreConfig<'local' | 'session' | 'memory'> = {}) => {
  const persist = config.persist;

  if (persist) {
    switch (persist.storage) {
      case 'local':
        persist.storage = local;
        break;
      case 'session':
        persist.storage = session;
        break;
    }
  }

  return storeHelper.createStore(config as ReduxStoreConfig);
};
