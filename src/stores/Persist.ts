import { StoreHelper, ReduxStoreConfig } from './StoreHelper';
import { PersistStorage } from './PersistStorage';
import memory from '../storages/memoryStorage';

export const TYPE_REHYDRATE = 'ReduxModel/rehydrate';

export class Persist {
  protected readonly keyPrefix = 'ReduxModel:Persist:';
  protected readonly storeHelper: StoreHelper;
  protected readonly schema: { __persist: { version: number | string } };
  protected config: ReduxStoreConfig['persist'];
  protected bootstrapped: boolean = false;
  protected allowKeys: string[] = [];
  protected mapFromModelToKey: Record<string, string | undefined> = {};

  protected persistReducers: Record<string, any> = {};
  protected serializedStrings: Record<string, string> = {};

  protected subscription: string[] = [];
  protected readyEvents: Function[] = [];

  // @ts-ignore It will exists by setConfig()
  protected storage: PersistStorage;

  constructor(storeHelper: StoreHelper) {
    this.storeHelper = storeHelper;
    this.schema = {
      __persist: { version: '' },
    };
  }

  setConfig(config: ReduxStoreConfig['persist']): this {
    this.config = config;

    if (!config) {
      return this.onBootstrapped();
    }

    switch (config.storage) {
      case 'memory':
        this.storage = memory;
        break;
      default:
        this.storage = config.storage;
    }

    const { allowlist = {}, version } = config;

    this.bootstrapped = false;
    this.schema.__persist.version = version;
    this.allowKeys = [];
    this.mapFromModelToKey = {};

    Object.keys(allowlist).forEach((key) => {
      this.allowKeys.push(key);
      this.mapFromModelToKey[allowlist[key].getReducerName()] = key;
    });

    return this;
  }

  async rehydrate(): Promise<any> {
    if (this.bootstrapped || !this.config) {
      return;
    }

    const data = await this.storage.getItem(this.keyPrefix + this.config.key);

    if (data === null) {
      return this.resetAndRestore().onParsed().onBootstrapped();
    }

    try {
      const tempReducers = JSON.parse(data);
      if (tempReducers.__persist.version === this.config.version) {
        let shouldRestore = false;
        delete tempReducers.__persist;

        this.persistReducers = {};
        Object.keys(tempReducers).forEach((key) => {
          if (this.allowKeys.indexOf(key) >= 0) {
            this.serializedStrings[key] = tempReducers[key];
            this.persistReducers[key] = JSON.parse(tempReducers[key]);
          } else {
            shouldRestore = shouldRestore || true;
          }
        });

        if (shouldRestore) {
          this.restore();
        }
      } else {
        this.resetAndRestore();
      }
    } catch (e) {
      this.resetAndRestore();
      console.error('Unable to parser persist reducers from storage: ' + e.message);
    }

    this.onParsed().onBootstrapped();
  }

  update(nextState: any, force: boolean): void {
    if (!this.config) {
      return;
    }

    // Persist is not ready before dispatch action TYPE_REHYDRATE
    if (!this.bootstrapped && !force) {
      return;
    }

    const tempState: Record<string, any> = { ...this.persistReducers };
    let changed: boolean = false;

    Object.keys(this.mapFromModelToKey).forEach((reducerName) => {
      const key = this.mapFromModelToKey[reducerName]!;

      tempState[key] = nextState[reducerName];

      if (nextState[reducerName] !== this.persistReducers[key]) {
        const tempString = JSON.stringify(nextState[reducerName]);

        changed = changed || this.serializedStrings[key] !== tempString;
        this.serializedStrings[key] = tempString;
      }
    });

    this.persistReducers = tempState;

    if (changed) {
      this.restore();
    }
  }

  isReady() {
    return this.bootstrapped;
  }

  getPersistData<T>(reducerName: string, state: T): T {
    if (!this.config) {
      return state;
    }

    const key = this.mapFromModelToKey[reducerName];
    if (!key) {
      return state;
    }

    if (!this.bootstrapped) {
      if (this.subscription.indexOf(reducerName) === -1) {
        this.subscription.push(reducerName);
      }

      return state;
    }

    const persistState = this.persistReducers[key];
    return persistState === undefined ? state : persistState;
  }

  protected onParsed(): this {
    if (this.subscription.length) {
      const payload: Record<string, any> = {};
      let canDispatch = false;

      this.subscription.forEach((reducerName) => {
        const persistKey = this.mapFromModelToKey[reducerName];

        if (persistKey) {
          canDispatch = true;
          payload[reducerName] = this.persistReducers[persistKey];
        }
      });
      this.subscription = [];

      if (canDispatch) {
        this.storeHelper.dispatch({
          type: TYPE_REHYDRATE,
          payload,
        });
      }
    }

    return this;
  }

  protected resetAndRestore(): this {
    this.persistReducers = {};
    this.subscription = [];
    this.restore();

    return this;
  }

  protected onBootstrapped(): this {
    this.bootstrapped = true;

    if (this.readyEvents.length) {
      this.readyEvents.forEach((item) => item());
      this.readyEvents = [];
    }

    return this;
  }

  listen(fn: () => void): Function {
    this.readyEvents.push(fn);

    if (this.bootstrapped) {
      setTimeout(() => {
        if (this.bootstrapped) {
          this.onBootstrapped();
        }
      });
    }

    return () => {
      this.readyEvents = this.readyEvents.filter((item) => item !== fn);
    };
  };

  protected restore(): this {
    if (!this.config) {
      return this;
    }

    const strings = {};

    // Restore existing reducers
    Object.keys(this.persistReducers).forEach((key) => {
      strings[key] = this.serializedStrings[key];
    });

    this.storage.setItem(this.keyPrefix + this.config.key, JSON.stringify({
      ...strings,
      ...this.schema,
    }));

    return this;
  };
}
