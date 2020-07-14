import { Store, PreloadedState, Reducer, combineReducers, createStore, AnyAction, Middleware, compose, applyMiddleware } from 'redux';
import { IReducers } from '../reducers/BaseReducer';
import { StoreNotFoundError } from '../exceptions/StoreNotFoundError';
import { PersistStorage } from './PersistStorage';
import { BaseModel } from '../models/BaseModel';
import { Persist, TYPE_REHYDRATE } from './Persist';
import { DynamicMiddleware } from './DynamicMiddleware';

export interface ReduxStoreConfig<Engine extends string = 'memory'> {
  reducers?: IReducers;
  compose?: typeof compose;
  middleware?: Middleware[];
  preloadedState?: PreloadedState<any>;
  onCombineReducers?: (reducer: Reducer) => Reducer;
  persist?: false | {
    version: string | number;
    key: string;
    storage: PersistStorage | Engine;
    allowlist: Record<string, BaseModel<any>>;
  };
}

export class StoreHelper {
  protected readonly __persist: Persist;
  protected readonly __dynamicMiddleware: DynamicMiddleware;
  protected __store?: Store;
  protected autoReducers: IReducers = {};
  protected userReducers: IReducers = {};
  protected listeners: Array<(storeHelper: StoreHelper) => void> = [];
  protected isDispatching: boolean = false;
  protected stateWhenDispatching: object = {};
  protected onCombineReducers: ReduxStoreConfig['onCombineReducers'];

  constructor() {
    this.__persist = new Persist(this);
    this.__dynamicMiddleware = new DynamicMiddleware();
  }

  createStore(config: ReduxStoreConfig): Store {
    const { onCombineReducers, reducers = {}, preloadedState, compose: customCompose = compose, middleware = [] } = config;

    this.onCombineReducers = onCombineReducers;
    this.userReducers = reducers;
    this.__persist.setConfig(config.persist);

    const combined = this.combindReducers();

    if (this.__store) {
      this.store.replaceReducer(combined);
    } else {
      this.__store = createStore(
        combined,
        preloadedState,
        customCompose(applyMiddleware(this.__dynamicMiddleware.create(), ...middleware))
      );
      this.publish();
    }

    return this.__store!;
  }

  appendReducers(reducers: IReducers): this {
    this.autoReducers = {
      ...this.autoReducers,
      ...reducers,
    };

    if (this.__store) {
      this.__store.replaceReducer(this.combindReducers());
    }

    return this;
  }

  get middleware(): DynamicMiddleware {
    return this.__dynamicMiddleware;
  }

  get store(): Store {
    if (!this.__store) {
      throw new StoreNotFoundError();
    }

    return this.__store;
  }

  get persist(): Persist {
    return this.__persist;
  }

  dispatch<T extends AnyAction>(action: T): any {
    return this.store.dispatch(action);
  }

  getState(): object {
    return this.isDispatching ? this.stateWhenDispatching : this.store.getState();
  }

  listenOnce(fn: (storeHelper: StoreHelper) => void): this {
    this.listeners.push(fn);

    if (this.__store) {
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
        this.persist.update(mainResult, action.type === TYPE_REHYDRATE);
      }

      this.isDispatching = false;
      this.stateWhenDispatching = {};

      return mainResult;
    };
  }
}

export const storeHelper = new StoreHelper();
