import { Store, PreloadedState, Reducer, createStore, AnyAction, Middleware, compose, applyMiddleware } from 'redux';
import { IReducers } from '../reducers/BaseReducer';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';
import { BaseModel } from '../models/BaseModel';
import { Persist, PersistStorage } from './Persist';
import ACTION_TYPES from '../utils/actionType';
import { fromSSR } from '../utils/ssr';

export interface ReduxStoreConfig<Engine extends string = 'memory'> {
  /**
   * Accept custom reducer which is not created by model.
   */
  reducers?: IReducers;
  compose?: 'default' | 'redux-devtools' | typeof compose;
  middleware?: Middleware[];
  preloadedState?: PreloadedState<any>;
  persist?: {
    version: string | number;
    /**
     * The storage key
     */
    key: string;
    storage: PersistStorage | Engine;
    /**
     * {
     *   xModel,
     *   yModel,
     *   zModel,
     * }
     */
    allowlist: Record<string, BaseModel<any>>;
  };
}

export class StoreHelper {
  protected readonly _persist: Persist;
  protected _store?: Store;
  public/*protected*/ reducers: IReducers = {};
  protected reducerKeys: string[] = [];
  protected dispatching: boolean = false;
  protected state: object = {};
  protected readonly combined: Reducer;

  constructor() {
    this._persist = new Persist(this);
    this.combined = this.combineReducers();
  }

  createStore(config: ReduxStoreConfig = {}): Store {
    const { reducers, middleware } = config;
    const customCompose = (() => {
      switch (config.compose) {
        case 'redux-devtools':
          return typeof window === 'object' && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
        case 'default':
          return compose;
        default:
          return config.compose || compose;
      }
    })();
    const persist = this._persist;

    reducers && Object.keys(reducers).forEach((key) => {
      this.reducers[key] = reducers[key];
    });
    this.reducerKeys = Object.keys(this.reducers);
    persist.rehydrate(config.persist);
    let store = this._store;

    if (store) {
      store.replaceReducer(this.combined);
    } else {
      store = this._store = createStore(
        this.combined,
        config.preloadedState || fromSSR(),
        customCompose(applyMiddleware.apply(null, middleware || []))
      );
    }

    return store;
  }

  appendReducers(autoReducer: IReducers): void {
    // Only 0-1 reducer will be provided.
    const key = Object.keys(autoReducer)[0];

    if (key) {
      const store = this._store;
      const exists = store && this.reducers.hasOwnProperty(key);
      this.reducers[key] = autoReducer[key];

      if (store && !exists) {
        this.reducerKeys = Object.keys(this.reducers);
        store.replaceReducer(this.combined);
      }
    }
  }

  get store(): Store {
    if (!this._store) {
      throw new StoreNotFoundError();
    }

    return this._store;
  }

  get persist(): Persist {
    return this._persist;
  }

  dispatch<T extends AnyAction>(action: T): T {
    return this.store.dispatch(action);
  }

  getState(): { readonly [key: string]: any } {
    return this.dispatching ? this.state : this.store.getState();
  }

  onCreated(fn: () => void): Function {
    return this.persist.listenOnce(fn);
  }

  protected combineReducers(): Reducer {
    return (state, action) => {
      if (state === undefined) {
        state = {};
      }

      this.dispatching = true;
      this.state = state;

      const reducerKeys = this.reducerKeys;
      const keyLength = reducerKeys.length;
      const nextState = {};
      let hasChanged = false;

      for (let i = 0; i < keyLength; ++i) {
        const key = reducerKeys[i];
        const reducer = this.reducers[key];
        const previousStateForKey = state[key];
        const nextStateForKey = reducer(previousStateForKey, action);

        nextState[key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }

      hasChanged = hasChanged || keyLength !== Object.keys(state).length;

      if (hasChanged) {
        this.persist.update(nextState, action.type === ACTION_TYPES.persist);
      }

      this.dispatching = false;
      this.state = {};

      return hasChanged ? nextState : state;
    };
  }
}

export const storeHelper = new StoreHelper();
