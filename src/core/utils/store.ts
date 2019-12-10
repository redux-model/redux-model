import { Action, combineReducers, createStore, DeepPartial, Reducer, Store, StoreEnhancer } from 'redux';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';
import { Reducers } from './types';
import { isDebug } from '../../libs/dev';
import { PersistStorage } from '../../libs/types';
import { handlePersist, setPersistConfig, TYPE_REHYDRATE, updatePersistState } from './persist';
import { BaseModel } from '../BaseModel';

export interface ReduxStoreConfig<S = any, A extends Action = Action> {
  reducers?: Reducers;
  enhancer?: StoreEnhancer;
  preloadedState?: DeepPartial<S>;
  onCombineReducers?: (reducer: Reducer<S, A>) => Reducer<S, A>;
  persist?: false | {
    version: string | number;
    key: string;
    storage: PersistStorage;
    whitelist?: Array<BaseModel<any>>;
    blacklist?: Array<BaseModel<any>>;
  };
}

const hasEffectsReducers: string[] = [];
const autoReducers: Reducers = {};
let usersReducers: Reducers = {};
let store: Store | undefined;
let listeners: Array<(store: Store) => void> = [];
let onCombineReducers: ReduxStoreConfig['onCombineReducers'];
let stateWhenDispatching: any;
let isDispatching = false;

const combine = () => {
  if (isDebug()) {
    Object.keys(usersReducers).forEach((key) => {
      if (autoReducers[key] && hasEffectsReducers.indexOf(key) === -1) {
        // Indeed, it's reducer name but not model name
        console.warn(`Model '${key}' has been registered automatically, do not register it again.`);
      }
    });
  }

  let combined = combineReducers({ ...autoReducers, ...usersReducers });
  if (onCombineReducers) {
    combined = onCombineReducers(combined);
  }

  return (state, action) => {
    isDispatching = true;
    stateWhenDispatching = state;
    const result = combined(state, action);

    if (action.type !== TYPE_REHYDRATE && stateWhenDispatching !== result) {
      updatePersistState(result);
    }

    isDispatching = false;

    return result;
  };
};

export const watchEffectsReducer = (reducerName: string, className: string) => {
  hasEffectsReducers.push(reducerName);

  if (usersReducers[reducerName]) {
    return;
  }

  onStoreCreated(() => {
    setTimeout(() => {
      if (!usersReducers[reducerName]) {
        console.error(
          `Model '${className}' has override protected method 'effects()', consider register its instance manually:


Example:

const store = createReduxStore({
  reducers: {
    ...aModel.register(),
    ...bModel.register(),
    ...cModel.register(),
  }
});


`
        );
      }
    });
  });
};

export const appendReducers = (reducers: Reducers) => {
  Object.assign(autoReducers, reducers);

  store?.replaceReducer(combine());
};

export function createReduxStore<S = any>(config: ReduxStoreConfig<S>): Store<S> {
  usersReducers = config.reducers || {};
  onCombineReducers = config.onCombineReducers;

  setPersistConfig(config.persist);

  if (store) {
    store.replaceReducer(combine());
  } else {
    store = createStore(combine(), config.preloadedState, config.enhancer);
    listeners.forEach((listener) => listener(store!));
    listeners = [];
  }

  handlePersist(store);

  return store;
}

export const getStore = () => {
  if (!store) {
    throw new StoreNotFoundError();
  }

  return store;
};

export const getState = () => {
  return isDispatching ? stateWhenDispatching : getStore().getState();
};

export const onStoreCreated = (fn: (store: Store) => void): void => {
  if (store) {
    fn(store);
  } else {
    listeners.push(fn);
  }
};
