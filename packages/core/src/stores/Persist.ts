import { StoreHelper, ReduxStoreConfig } from './StoreHelper';
import memory from '../storages/memoryStorage';
import ACTION_TYPES from '../utils/actionType';
import { IActionPayload } from '../actions/BaseAction';

/**
 * We don't need method `removeItem` here
 */
export interface PersistStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface IPersistRehydrate extends IActionPayload<Record<string, any>> {}

export class Persist {
  protected readonly keyPrefix = 'ReduxModel:Persist:';
  protected readonly storeHelper: StoreHelper;
  protected readonly schema: { __persist: { version: number | string } };
  protected cacheData?: string | null;
  protected config: ReduxStoreConfig['persist'];
  protected ready: boolean = false;
  protected allowKeys: string[] = [];
  protected mapFromModelToKey: Record<string, string | undefined> = {};

  protected persistStates: Record<string, any> = {};
  protected serializedStrings: Record<string, string> = {};

  protected subscription: string[] = [];
  protected readyEvents: Function[] = [];

  // @ts-ignore It will exists by rehydrate()
  protected storage: PersistStorage;

  protected restoreTimer?: NodeJS.Timeout;

  constructor(storeHelper: StoreHelper) {
    this.storeHelper = storeHelper;
    this.restoreHandle = this.restoreHandle.bind(this);
    this.schema = {
      __persist: { version: '' },
    };
  }

  rehydrate(config: ReduxStoreConfig['persist']): void {
    const originalConfig = this.config;
    this.config = config;
    this.ready = false;

    if (!config) {
      return void this.onReady();
    }

    const { allowlist, version, storage } = config;

    this.storage = storage === 'memory' ? memory : storage;
    this.schema.__persist.version = version;
    this.allowKeys = [];
    this.mapFromModelToKey = {};

    Object.keys(allowlist).forEach((key) => {
      const model = allowlist[key];
      this.allowKeys.push(key);
      this.mapFromModelToKey[model.getReducerName()] = key;
    });

    if (
      this.cacheData !== undefined &&
      (
        !originalConfig ||
        originalConfig.key !== config.key ||
        originalConfig.storage !== config.storage
      )
    ) {
      this.cacheData = undefined;
    }

    if (this.cacheData === undefined) {
      this.storage
        .getItem(this.keyPrefix + config.key)
        .then((data) => {
          config === this.config && this.parseData(this.cacheData = data);
        });
    } else {
      this.parseData(this.cacheData);
    }
  }

  update(nextState: any, force: boolean): void {
    if (!this.config) {
      return;
    }

    // Persist is not ready before dispatch action TYPE_REHYDRATE
    if (!this.ready && !force) {
      return;
    }

    const tempState: Record<string, any> = { ...this.persistStates };
    let changed: boolean = false;

    Object.keys(this.mapFromModelToKey).forEach((reducerName) => {
      const key = this.mapFromModelToKey[reducerName]!;

      tempState[key] = nextState[reducerName];

      if (nextState[reducerName] !== this.persistStates[key]) {
        const tempString = JSON.stringify(nextState[reducerName]);

        changed = changed || this.serializedStrings[key] !== tempString;
        this.serializedStrings[key] = tempString;
      }
    });

    this.persistStates = tempState;

    if (changed) {
      this.restore();
    }
  }

  isReady() {
    return this.ready;
  }

  getPersistData(reducerName: string): any {
    if (!this.config) {
      return;
    }

    const key = this.mapFromModelToKey[reducerName];
    if (!key) {
      return;
    }

    if (!this.ready) {
      if (!~this.subscription.indexOf(reducerName)) {
        this.subscription.push(reducerName);
      }

      return;
    }

    return this.persistStates[key];
  }

  listen(fn: () => void): Function {
    this.readyEvents.push(fn);

    if (this.ready) {
      this.onReady();
    }

    return () => {
      this.readyEvents = this.readyEvents.filter((item) => item !== fn);
    };
  };

  listenOnce(fn: () => void): Function {
    const unlisten = this.listen(() => {
      unlisten();
      fn();
    });

    return unlisten;
  }

  protected parseData(data: string | null): void {
    if (!this.config) {
      return;
    }

    if (data === null) {
      return void this.resetAndRestore().onParsed().onReady();
    }

    try {
      const tempStates = JSON.parse(data);
      if (tempStates.__persist.version === this.config.version) {
        let shouldRestore = false;
        delete tempStates.__persist;

        this.persistStates = {};
        Object.keys(tempStates).forEach((key) => {
          if (~this.allowKeys.indexOf(key)) {
            this.serializedStrings[key] = tempStates[key];
            this.persistStates[key] = JSON.parse(tempStates[key]);
          } else {
            shouldRestore = true;
          }
        });

        shouldRestore && this.restore();
      } else {
        this.resetAndRestore();
      }
    } catch (e) {
      this.resetAndRestore();
      console.error('Unable to parse persist reducers from storage: ' + e.message);
    }

    this.onParsed().onReady();
  }

  protected onParsed(): this {
    if (this.subscription.length) {
      const payload: Record<string, any> = {};
      let canDispatch = false;

      this.subscription.forEach((reducerName) => {
        const persistKey = this.mapFromModelToKey[reducerName];

        if (persistKey) {
          canDispatch = true;
          payload[reducerName] = this.persistStates[persistKey];
        }
      });
      this.subscription = [];

      if (canDispatch) {
        this.storeHelper.dispatch<IPersistRehydrate>({
          type: ACTION_TYPES.persist,
          payload,
        });
      }
    }

    return this;
  }

  protected resetAndRestore(): this {
    this.persistStates = {};
    this.subscription = [];
    this.restore();

    return this;
  }

  protected onReady(): this {
    this.ready = true;

    if (this.readyEvents.length) {
      // onReady will invoke before store.replaceReducer().
      // Some reducer may be not initialized currently, so just delay to run callback.
      setTimeout(() => {
        this.readyEvents.forEach((item) => item());
      });
    }

    return this;
  }

  protected restore(): this {
    if (!this.config) {
      return this;
    }

    this.restoreTimer !== undefined && clearTimeout(this.restoreTimer);
    this.restoreTimer = setTimeout(this.restoreHandle, 8);

    return this;
  }

  private restoreHandle(): void {
    if (!this.config) {
      return;
    }

    const strings = {};

    // Restore existing reducers
    Object.keys(this.persistStates).forEach((key) => {
      strings[key] = this.serializedStrings[key];
    });

    const storageData = JSON.stringify({
      ...strings,
      ...this.schema,
    });

    this.storage.setItem(this.keyPrefix + this.config.key, storageData);
    this.cacheData = storageData;
    this.restoreTimer = undefined;
  }
}
