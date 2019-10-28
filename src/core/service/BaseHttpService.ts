import cloneDeep from 'lodash.clonedeep';
import {
  ActionResponseHandle,
  EnhanceData,
  EnhanceMeta,
  EnhancePayload,
  EnhanceResponse,
  HttpServiceNoMeta,
  HttpServiceWithMeta,
  HttpServiceWithMetas,
  OrphanRequestOptions,
  RequestActionNoMeta,
  RequestActionWithMeta,
  RequestActionWithMetas,
  BaseHttpServiceConfig,
} from '../utils/types';
import { METHOD } from '../utils/method';
import { OrphanHttpServiceHandle } from './OrphanHttpServiceHandle';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { AnyAction } from 'redux';
import { getStore } from '../utils/createReduxStore';
import { RequestAction } from '../../libs/RequestAction';
import { getInstanceName, increaseActionCounter } from '../utils/instanceName';
import { isDebug } from '../../libs/dev';
import { isProxyEnable } from '../utils/dev';

export abstract class BaseHttpService {
  protected readonly config: BaseHttpServiceConfig;

  protected caches: Partial<{
    [key: string]: {
      timestamp: number;
      response: any;
    };
  }> = {};

  constructor(config: BaseHttpServiceConfig) {
    this.config = config;
  }

  public action<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  public action<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public action<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public action(fn: any): any {
    let instanceName = getInstanceName();

    if (!isDebug() || !isProxyEnable()) {
      instanceName += '_' + increaseActionCounter();
    }

    return new RequestAction(fn, instanceName, this.withCache.bind(this));
  }

  public getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.get, this);

    return this.withCache(service.collect());
  }

  public postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.post, this);

    return this.withCache(service.collect());
  }

  public putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.put, this);

    return this.withCache(service.collect());
  }

  public deleteAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.delete, this);

    return this.withCache(service.collect());
  }

  protected getCacheKey(action: ActionRequest | ActionResponseHandle): string {
    const actionType = typeof action.type === 'string' ? action.type : action.type.success;

    return JSON.stringify([
      // type includes both class name and method name
      actionType,
      action.uri,
      action.method,
      action.body,
      action.query,
      action.requestOptions,
    ]);
  }

  protected withCache<Response, Payload>(action: ActionRequest): FetchHandle<Response, Payload> {
    const key = this.getCacheKey(action);

    if (action.useCache && action.cacheMillSeconds > 0) {
      const item = this.caches[key];

      if (item && Date.now() - item.timestamp <= action.cacheMillSeconds) {
        const promise = new Promise((resolve) => {
          const fakeAction: ActionResponseHandle = {
            ...action,
            type: action.type.success,
            response: cloneDeep(item.response),
            effect: action.onSuccess,
          };

          this.next(fakeAction);
          this.triggerShowSuccess(fakeAction, action.successText);
          resolve(fakeAction);
        });
        const wrapPromise = promise as FetchHandle;

        wrapPromise.cancel = () => {};

        return wrapPromise;
      }
    }

    // In case user toggle cache flag
    // In case data is expired
    Reflect.deleteProperty(caches, key);

    return this.runAction(action);
  }

  protected collectResponse(action: ActionResponseHandle): void {
    if (action.useCache && action.cacheMillSeconds > 0) {
      const key = this.getCacheKey(action);

      this.caches[key] = {
        timestamp: Date.now(),
        response: cloneDeep(action.response),
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
