import { Store, PreloadedState, Reducer, combineReducers, createStore, AnyAction, Middleware, compose, applyMiddleware } from 'redux';
import { IReducers } from '../reducers/BaseReducer';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';
import { PersistStorage } from './PersistStorage';
import { BaseModel } from '../models/BaseModel';
import { Persist } from './Persist';
import { DynamicMiddleware } from './DynamicMiddleware';
import ACTION_TYPES from '../utils/actionType';

export interface ReduxStoreConfig<Engine extends string = 'memory'> {
  reducers?: IReducers;
  compose?: typeof compose;
  middleware?: Middleware[];
  preloadedState?: PreloadedState<any>;
  onCombineReducers?: (reducer: Reducer) => Reducer;
  persist?: {
    version: string | number;
    key: string;
    storage: PersistStorage | Engine;
    allowlist: Record<string, BaseModel<any> | string>;
  };
}

export class StoreHelper {
  protected readonly _persist: Persist;
  protected readonly _dynamicMiddleware: DynamicMiddleware;
  protected _store?: Store;
  protected autoReducers: IReducers = {};
  protected userReducers: IReducers = {};
  protected listeners: Array<(storeHelper: StoreHelper) => void> = [];
  protected isDispatching: boolean = false;
  protected stateWhenDispatching: object = {};
  protected onCombineReducers: ReduxStoreConfig['onCombineReducers'];

  constructor() {
    this._persist = new Persist(this);
    this._dynamicMiddleware = new DynamicMiddleware();
  }

  createStore(config: ReduxStoreConfig = {}): Store {
    const { onCombineReducers, reducers = {}, preloadedState, compose: customCompose = compose, middleware = [] } = config;

    this.onCombineReducers = onCombineReducers;
    this.userReducers = reducers;
    this._persist.setConfig(config.persist);

    const combined = this.combindReducers();

    if (this._store) {
      // Avoid to dispatch persist data for @@redux/x.y.z triggerred by replaceReducer()
      this.persist.rehydrate();
      this.store.replaceReducer(combined);
    } else {
      this._store = createStore(
        combined,
        preloadedState,
        customCompose(applyMiddleware(this._dynamicMiddleware.create(), ...middleware))
      );
      this.publish();
      this.persist.rehydrate();
    }

    return this._store!;
  }

  appendReducers(reducers: IReducers): this {
    this.autoReducers = {
      ...this.autoReducers,
      ...reducers,
    };

    if (this._store) {
      this._store.replaceReducer(this.combindReducers());
    }

    return this;
  }

  get middleware(): DynamicMiddleware {
    return this._dynamicMiddleware;
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

  dispatch<T extends AnyAction>(action: T): any {
    return this.store.dispatch(action);
  }

  getState(): object {
    return this.isDispatching ? this.stateWhenDispatching : this.store.getState();
  }

  listenOnce(fn: (storeHelper: StoreHelper) => void): this {
    this.listeners.push(fn);

    if (this._store) {
      setTimeout(() => {
        this.publish();
      });
    }

    return this;
  }

  protected publish(): void {
    this.listeners.forEach((listener) => listener(this));
    this.listeners = [];
  }

  protected combindReducers(): Reducer {
    let combined = combineReducers({
      ...this.autoReducers,
      ...this.userReducers,
    });
    if (this.onCombineReducers) {
      combined = this.onCombineReducers(combined);
    }

    return (state, action) => {
      this.isDispatching = true;
      this.stateWhenDispatching = state;

      let mainResult = combined(state, action);

      if (this.stateWhenDispatching !== mainResult) {
        this.persist.update(mainResult, action.type === ACTION_TYPES.persist);
      }

      this.isDispatching = false;
      this.stateWhenDispatching = {};

      return mainResult;
    };
  }
}

export const storeHelper = new StoreHelper();
