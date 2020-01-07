import { Store } from 'redux';
import { shallowEqualObjects } from 'shallow-equal';
import { ReduxStoreConfig } from './store';
import { getStorageItem, setStorage, setStorageItem } from '../../libs/storage';
import { BaseModel } from '../BaseModel';

export const TYPE_REHYDRATE = 'ReduxModel/rehydrate';

let globalStore: Store | undefined;
const defaultPersistOption: { __persist: { version: number | string } } = {
  __persist: { version: -1 },
};
const KEY_PREFIX = 'ReduxModel:Persist:';
let whiteList: Record<string, BaseModel<any>> = {};
let model2persistDict: Record<string, string> = {};
let restoreDelay: number = 0;
let subscription: string[] = [];
let persistReducers: Record<string, any> = {};
let objectStrings: Record<string, string> = {};
let config: ReduxStoreConfig['persist'] = false;
let ready: boolean = false;
let readyEvents: Function[] = [];
let timer: NodeJS.Timeout | undefined;

const resetPersist = (): void => {
  persistReducers = {};
  subscription = [];
  restorePersist();
};

const persistIsReady = () => {
  ready = true;

  if (readyEvents.length) {
    readyEvents.forEach(item => item());
    readyEvents = [];
  }
};

const restorePersist = (): void => {
  if (!config) {
    return;
  }

  const strings = {};

  Object.keys(persistReducers).forEach((key) => {
    strings[key] = objectStrings[key];
  });

  setStorageItem(KEY_PREFIX + config.key, JSON.stringify({
    ...strings,
    ...defaultPersistOption,
  }));
};

const parseStorageData = (data: string | null) => {
  if (!config) {
    return;
  }

  if (data === null) {
    resetPersist();
  } else {
    try {
      const tempReducers = JSON.parse(data);
      if (tempReducers.__persist.version === config.version) {
        let shouldRestore = false;
        const persistKeys = Object.values(model2persistDict);

        delete tempReducers.__persist;

        persistReducers = {};
        Object.keys(tempReducers).forEach((key) => {
          if (persistKeys.includes(key)) {
            objectStrings[key] = tempReducers[key];
            persistReducers[key] = JSON.parse(tempReducers[key]);
          } else {
            shouldRestore = true;
          }
        });

        if (shouldRestore) {
          restorePersist();
        }
      } else {
        resetPersist();
      }
    } catch (e) {
      resetPersist();
      console.error('Unable to parser persist reducers from storage: ' + e.message);
    }
  }

  if (subscription.length) {
    const payload: Record<string, any> = {};

    subscription.forEach((reducerName) => {
      const persistKey = model2persistDict[reducerName];

      if (persistKey) {
        payload[reducerName] = persistReducers[persistKey];
      }
    });
    subscription = [];
    globalStore!.dispatch({
      type: TYPE_REHYDRATE,
      payload,
    });
  }

  persistIsReady();
  // We don't need to collect initial data. Because they are useless.
};

export const setPersistConfig = (persist: ReduxStoreConfig['persist']): void => {
  if (config && shallowEqualObjects(config, persist)) {
    return;
  }

  config = persist;

  if (config) {
    ready = false;
    setStorage(config.storage);
    whiteList = config.whitelist || {};
    model2persistDict = Object.keys(whiteList).reduce((carry, persistKey) => {
      carry[whiteList[persistKey].getReducerName()] = persistKey;
      return carry;
    }, {});
    defaultPersistOption.__persist.version = config.version;
    restoreDelay = config.restoreDelay === undefined ? 0 : Number(config.restoreDelay) || 0;
  } else {
    persistIsReady();
  }
};

export const handlePersist = (store: Store) => {
  globalStore = store;

  if (config && !ready) {
    const storageData = getStorageItem(KEY_PREFIX + config.key) as string | null | Promise<string | null>;

    if (storageData === null || typeof storageData === 'string') {
      parseStorageData(storageData);
    } else {
      storageData.then(parseStorageData);
    }
  }
};

// Since whitelist is required, model instances who want to link persist are always created before store.
export const subscribePersistRehydrate = (reducerName: string): void => {
  if (!ready) {
    subscription.push(reducerName);
  }
};

export const updatePersistState = (state: any): void => {
  if (!config || !ready) {
    return;
  }

  // Sync models + async models
  const tempPersistReducers: Record<string, any> = { ...persistReducers };
  let changed: boolean = false;

  Object.entries(model2persistDict).forEach(([reducerName, persistKey]) => {
    tempPersistReducers[persistKey] = state[reducerName];

    if (state[reducerName] !== persistReducers[persistKey]) {
      const tempString = JSON.stringify(state[reducerName]);

      if (!changed && objectStrings[persistKey] !== tempString) {
        changed = true;
      }

      objectStrings[persistKey] = tempString;
    }
  });

  persistReducers = tempPersistReducers;

  if (!changed) {
    return;
  }

  if (restoreDelay <= 0) {
    return restorePersist();
  }

  if (timer === undefined) {
    timer = setTimeout(() => {
      restorePersist();
      timer = undefined;
    }, restoreDelay);
  }
};

export const onPersistReady = (fn: () => void): void => {
  if (ready) {
    fn();
  } else {
    readyEvents.push(fn);
  }
};

export const isPersistReady = (): boolean => {
  return ready;
};
