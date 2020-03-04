import cloneDeep from 'clone';
import {
  ActionResponseHandle,
  EnhanceData,
  EnhanceMeta,
  EnhancePayload,
  EnhanceResponse,
  HttpServiceWithMeta,
  HttpServiceWithMetas,
  OrphanRequestOptions,
  RequestActionWithMeta,
  RequestActionWithMetas,
  BaseHttpServiceConfig,
} from '../utils/types';
import { METHOD } from '../utils/method';
import { OrphanHttpServiceHandle } from './OrphanHttpServiceHandle';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { AnyAction } from 'redux';
import { getStore } from '../utils/store';
import { RequestAction } from '../../libs/RequestAction';
import { getInstanceName, increaseActionCounter } from '../utils/instanceName';
import { useProxy } from '../utils/dev';

export abstract class BaseHttpService {
  protected readonly config: BaseHttpServiceConfig;

  protected caches: Partial<{
    [key: string]: Partial<{
      [key: string]: {
        timestamp: number;
        response: any;
      };
    }>;
  }> = {};

  constructor(config: BaseHttpServiceConfig) {
    this.config = config;
  }

  public action<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public action<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public action(fn: any): any {
    let instanceName = getInstanceName();

    if (!useProxy()) {
      instanceName += '_' + increaseActionCounter();
    }

    return new RequestAction({
      request: fn,
      instanceName,
      runAction: this.withThrottle.bind(this),
      clearThrottle: this.clearThrottle.bind(this),
    });
  }

  public getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.get, this);

    return this.withThrottle(service.collect());
  }

  public postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.post, this);

    return this.withThrottle(service.collect());
  }

  public putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.put, this);

    return this.withThrottle(service.collect());
  }

  public deleteAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.delete, this);

    return this.withThrottle(service.collect());
  }

  protected generateThrottleKey(action: ActionRequest): string {
    return JSON.stringify([
      action.reducerName,
      action.type,
      action.uri,
      action.method,
      action.body,
      action.query,
      action.requestOptions,
    ]);
  }

  protected clearThrottle(key: string): void {
    Reflect.deleteProperty(this.caches, key);
  }

  protected withThrottle<Response, Payload>(action: ActionRequest): FetchHandle<Response, Payload> {
    const throttleKey = this.generateThrottleKey(action);
    const key = action.type.success;
    const cacheData = this.caches[key];

    if (!action.useThrottle) {
      if (cacheData) {
        // Delete cache in case of toggle throttle
        Reflect.deleteProperty(cacheData, throttleKey);
      }

      return this.runAction(action);
    }

    const item = cacheData?.[throttleKey];

    action.throttleKey = throttleKey;

    if (item) {
      if (Date.now() <= item.timestamp) {
        const promise = new Promise((resolve) => {
          const fakeAction: ActionResponseHandle = {
            ...action,
            type: action.type.success,
            response: cloneDeep(item.response, false),
            effect: action.onSuccess,
          };

          this.next(fakeAction);
          this.triggerShowSuccess(fakeAction, action.successText);
          resolve(fakeAction);
        });

        const wrapPromise = promise as FetchHandle;
        wrapPromise.cancel = () => {};
        return wrapPromise;
      } else if (cacheData) {
        Reflect.deleteProperty(cacheData, action.throttleKey);
      }
    }

    return this.runAction(action);
  }

  protected collectResponse(action: ActionResponseHandle): void {
    if (action.useThrottle && action.throttleMillSeconds > 0) {
      if (!this.caches[action.type]) {
        this.caches[action.type] = {};
      }

      this.caches[action.type]![action.throttleKey] = {
        timestamp: Date.now() + action.throttleMillSeconds,
        response: cloneDeep(action.response, false),
      };
    }
  }

  protected abstract runAction(action: any): any;

  protected next(action: AnyAction): void {
    if (action.type) {
      getStore().dispatch(action);
    }
  }

  protected triggerShowSuccess(okResponse: ActionResponseHandle, successText: string): void {
    if (successText) {
      this.config.onShowSuccess(successText, okResponse);
    }
  }

  protected triggerShowError(errorResponse: ActionResponseHandle, hideError: boolean | ((response: ActionResponseHandle) => boolean)): void {
    if (!errorResponse.message) {
      return;
    }

    let showError: boolean;

    if (typeof hideError === 'boolean') {
      showError = !hideError;
    } else {
      showError = !hideError(errorResponse);
    }

    if (showError) {
      this.config.onShowError(errorResponse.message, errorResponse);
    }
  }
}
