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

  protected persistReducers: Record<string, any> = {};
  protected serializedStrings: Record<string, string> = {};

  protected subscription: string[] = [];
  protected readyEvents: Function[] = [];

  // @ts-ignore It will exists by setConfig()
  protected storage: PersistStorage;

  protected restoreTimer?: NodeJS.Timeout;

  constructor(storeHelper: StoreHelper) {
    this.storeHelper = storeHelper;
    this.restoreHandle = this.restoreHandle.bind(this);
    this.schema = {
      __persist: { version: '' },
    };
  }

  setConfig(config: ReduxStoreConfig['persist']): this {
    const originalConfig = this.config;
    this.config = config;

    if (!config) {
      return this.onReady();
    }

    switch (config.storage) {
      case 'memory':
        this.storage = memory;
        break;
      default:
        this.storage = config.storage;
    }

    const { allowlist, version } = config;

    this.ready = false;
    this.schema.__persist.version = version;
    this.allowKeys = [];
    this.mapFromModelToKey = {};

    Object.keys(allowlist).forEach((key) => {
      const model = allowlist[key];

      this.allowKeys.push(key);
      this.mapFromModelToKey[model.getReducerName()] = key;
    });

    if (
      !originalConfig ||
      !config ||
      originalConfig.key !== config.key ||
      originalConfig.storage !== config.storage
    ) {
      this.cacheData = undefined;
    }

    return this;
  }

  rehydrate():void {
    if (this.ready || !this.config) {
      return;
    }

    if (this.cacheData !== undefined) {
      this.parseData(this.cacheData);
      return;
    }

    this.storage
      .getItem(this.keyPrefix + this.config.key)
      .then((data) => {
        this.cacheData = data;
        this.parseData(data);
      });
  }

  protected parseData(data: string | null): void {
    if (!this.config) {
      return;
    }

    if (data === null) {
      this.resetAndRestore().onParsed().onReady();
      return;
    }

    try {
      const tempReducers = JSON.parse(data);
      if (tempReducers.__persist.version === this.config.version) {
        let shouldRestore = false;
        delete tempReducers.__persist;

        this.persistReducers = {};
        Object.keys(tempReducers).forEach((key) => {
          if (~this.allowKeys.indexOf(key)) {
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
      console.error('Unable to parse persist reducers from storage: ' + e.message);
    }

    this.onParsed().onReady();
  }

  update(nextState: any, force: boolean): void {
    if (!this.config) {
      return;
    }

    // Persist is not ready before dispatch action TYPE_REHYDRATE
    if (!this.ready && !force) {
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

    return this.persistReducers[key];
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
        this.storeHelper.dispatch<IPersistRehydrate>({
          type: ACTION_TYPES.persist,
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

  protected onReady(): this {
    this.ready = true;

    if (this.readyEvents.length) {
      this.readyEvents.forEach((item) => item());
      this.readyEvents = [];
    }

    return this;
  }

  listen(fn: () => void): Function {
    this.readyEvents.push(fn);

    if (this.ready) {
      setTimeout(() => {
        if (this.ready) {
          this.onReady();
        }
      });
    }

    return () => {
      this.readyEvents = this.readyEvents.filter((item) => item !== fn);
    };
  };

  listenOnce(fn: () => void): void {
    const unlisten = this.listen(() => {
      unlisten();
      fn();
    });
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
    Object.keys(this.persistReducers).forEach((key) => {
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
