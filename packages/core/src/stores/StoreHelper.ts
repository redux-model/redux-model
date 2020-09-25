import { Store, PreloadedState, Reducer, combineReducers, createStore, AnyAction, Middleware, compose, applyMiddleware } from 'redux';
import { IReducers } from '../reducers/BaseReducer';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';
import { BaseModel } from '../models/BaseModel';
import { Persist, PersistStorage } from './Persist';
import ACTION_TYPES from '../utils/actionType';

export interface ReduxStoreConfig<Engine extends string = 'memory'> {
  reducers?: IReducers;
  compose?: 'default' | 'redux-devtools' | typeof compose;
  middleware?: Middleware[];
  preloadedState?: PreloadedState<any>;
  onCombineReducers?: (reducer: Reducer) => Reducer;
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
  protected autoReducers: IReducers = {};
  protected userReducers: IReducers = {};
  protected dispatching: boolean = false;
  protected state: object = {};
  protected onCombined: ReduxStoreConfig['onCombineReducers'];

  constructor() {
    this._persist = new Persist(this);
  }

  createStore(config: ReduxStoreConfig = {}): Store {
    const { onCombineReducers, reducers, preloadedState, middleware } = config;
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

    this.onCombined = onCombineReducers;
    this.userReducers = reducers || {};
    persist.setConfig(config.persist);

    const combined = this.combindReducers();

    if (this._store) {
      // Avoid to dispatch persist data of @@redux/x.y.z triggerred by replaceReducer()
      persist.rehydrate();
      this.store.replaceReducer(combined);
    } else {
      this._store = createStore(
        combined,
        preloadedState,
        customCompose(applyMiddleware.apply(null, middleware || []))
      );
      persist.rehydrate();
    }

    return this.store;
  }

  appendReducers(autoReducer: IReducers): void {
    // Only 0 or 1 reducer will be provided.
    const key = Object.keys(autoReducer)[0];

    if (key) {
      this.autoReducers[key] = autoReducer[key];

      const store = this._store;
      store && store.replaceReducer(this.combindReducers());
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

  getState(): object {
    return this.dispatching ? this.state : this.store.getState();
  }

  onCreated(fn: () => void): this {
    this.persist.listenOnce(fn);
    return this;
  }

  protected combindReducers(): Reducer {
    let combined = combineReducers({
      ...this.autoReducers,
      ...this.userReducers,
    });
    if (this.onCombined) {
      combined = this.onCombined(combined);
    }

    return (state, action) => {
      this.dispatching = true;
      this.state = state;

      let mainResult = combined(state, action);

      if (this.state !== mainResult) {
        this.persist.update(mainResult, action.type === ACTION_TYPES.persist);
      }

      this.dispatching = false;
      this.state = {};

      return mainResult;
    };
  }
}

export const storeHelper = new StoreHelper();
