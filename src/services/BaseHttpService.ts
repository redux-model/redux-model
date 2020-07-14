import { HttpServiceBuilderWithMeta, HttpServiceBuilderWithMetas, HttpServiceBuilder } from './HttpServiceBuilder';
import { IResponseAction, BaseRequestAction, IBaseRequestAction, InternalSuccessAction } from '../actions/BaseRequestAction';
import { Middleware, Action } from 'redux';
import cloneDeep from 'clone';
import { OrphanHttpService, OrphanRequestOptions } from './OrphanHttpService';
import { METHOD } from '../utils/method';
import { storeHelper } from '../stores/StoreHelper';

export interface FetchHandle<Response = any, Payload = any, CancelFn = () => void> extends Promise<IResponseAction<Response, Payload>> {
  cancel: CancelFn;
}

export type PickData<T> = T extends (...args: any[]) => HttpServiceBuilder<infer Data, any, any, any, any> ? Data : never;
export type PickResponse<T> = T extends (...args: any[]) => HttpServiceBuilder<any, infer Response, any, any, any> ? Response : never;
export type PickPayload<T> = T extends (...args: any[]) => HttpServiceBuilder<any, any, infer Payload, any, any> ? Payload : never;
export type PickMeta<T> = T extends (...args: any[]) => HttpServiceBuilderWithMetas<any, any, any, any, infer M> ? M : never;

export interface BaseHttpServiceConfig {
  baseUrl: string;
  requestConfig?: object;
  onShowSuccess: (successText: string, action: IResponseAction) => void;
  onShowError: (errorText: string, action: IResponseAction) => void;
  timeoutMessage?: (originalText: string) => string;
  networkErrorMessage?: (originalText: string) => string;
}

export const CLEAR_THROTTLE = '@flus/clear/throttle';

export interface IClearThrottleAction extends Action<string> {
  uniqueId: number;
  key: string;
}

export abstract class BaseHttpService<T extends BaseHttpServiceConfig, CancelFn> {
  protected readonly uniqueId: number;
  protected readonly config: T;

  protected caches: Partial<{
    [key: string]: Partial<{
      [key: string]: {
        timestamp: number;
        response: any;
      };
    }>;
  }> = {};

  constructor(config: T) {
    this.config = config;
    this.uniqueId = Date.now() + Math.random();

    storeHelper.middleware.use(this.uniqueId + '_throttle', this.createThrottleMiddleware());
    storeHelper.middleware.use(this.uniqueId + '_request', this.createRequestMiddleware());
  }

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMeta<Data, Response, Payload, any>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload, CancelFn>) & Omit<BaseRequestAction<Data, Fn, Response, Payload, true>, 'metas' | 'loadings'>;

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMetas<Data, Response, Payload, any, M>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>, M = PickMeta<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload, CancelFn>) & Omit<BaseRequestAction<Data, Fn, Response, Payload, M>, 'meta' | 'loading'>;

  public action(fn: any): any {
    return new BaseRequestAction(fn, this.uniqueId);
  }

  public getAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, never, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.get, this.uniqueId);

    return storeHelper.dispatch(service.collect());
  }

  public postAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, never, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.post, this.uniqueId);

    return storeHelper.dispatch(service.collect());
  }

  public putAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, never, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.put, this.uniqueId);

    return storeHelper.dispatch(service.collect());
  }

  public deleteAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, never, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.delete, this.uniqueId);

    return storeHelper.dispatch(service.collect());
  }

  public patchAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, never, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.patch, this.uniqueId);

    return storeHelper.dispatch(service.collect());
  }

  public connectAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, never, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.connect, this.uniqueId);

    return storeHelper.dispatch(service.collect());
  }

  protected generateThrottleKey(action: IBaseRequestAction): string {
    return JSON.stringify([
      action.modelName,           // determine model
      action.type,                // determine action
      action.uri,                 // params like: /user/2/post/3
      action.method,              // low compat, user always use the same method
      action.body,                // condition
      action.query,               // condition
      action.requestOptions,      // condition
    ]);
  }

  protected isFetchAction(action: IBaseRequestAction | InternalSuccessAction | IClearThrottleAction): action is IBaseRequestAction {
    return typeof action.type === 'object';
  }

  protected isClearAction(action: IBaseRequestAction | InternalSuccessAction | IClearThrottleAction): action is IClearThrottleAction {
    return action.type === CLEAR_THROTTLE;
  }

  protected createThrottleMiddleware(): Middleware {
    return () => (next) => (action: IBaseRequestAction | InternalSuccessAction | IClearThrottleAction) => {
      if (action.uniqueId !== this.uniqueId) {
        return next(action);
      }

      if (this.isClearAction(action)) {
        this.caches[action.key] === undefined;
        return action;
      }

      if (this.isFetchAction(action)) {
        const key = action.type.success;
        const cacheData = this.caches[key];

        if (!action.useThrottle) {
          if (cacheData) {
            cacheData[this.generateThrottleKey(action)] = undefined;
          }

          return next(action);
        } // end

        const throttleKey = this.generateThrottleKey(action);
        const item = cacheData?.[throttleKey];

        action.throttleKey = throttleKey;

        if (item && Date.now() <= item.timestamp) {
          const promise = new Promise((resolve) => {
            const fakeOkAction: InternalSuccessAction = {
              ...action,
              loading: false,
              type: action.type.success,
              response: cloneDeep(item.response, false),
              effect: action.onSuccess,
              fromThrottle: true,
            };

            storeHelper.dispatch(fakeOkAction);
            this.triggerShowSuccess(fakeOkAction, action.successText);
            resolve(fakeOkAction);
          });

          const wrapPromise = promise as FetchHandle;
          wrapPromise.cancel = () => {};
          return wrapPromise;
        } // end

        if (item) {
          cacheData![throttleKey] = undefined;
        }

        return next(action);
      } // end

      if (action.useThrottle && !action.fromThrottle && action.throttleMillSeconds > 0) {
        const type = action.type;

        if (type.lastIndexOf('success') !== type.length - 7) {
          return next(action);
        } // end

        this.caches[type] = this.caches[type] || {};
        this.caches[type]![action.throttleKey] = {
          timestamp: Date.now() + action.throttleMillSeconds,
          response: cloneDeep(action.response, false),
        };
      }

      return next(action);
    };
  }

  protected createRequestMiddleware(): Middleware {
    return () => (next) => (action: IBaseRequestAction) => {
      if (action.uniqueId !== this.uniqueId || typeof action.type !== 'object') {
        return next(action);
      }

      return this.runAction(action);
    };
  }

  protected abstract runAction(action: any): Promise<any>;

  protected triggerShowSuccess(okResponse: InternalSuccessAction, successText: string): void {
    if (successText) {
      this.config.onShowSuccess(successText, okResponse);
    }
  }

  protected triggerShowError(errorResponse: InternalSuccessAction, hideError: boolean | ((response: InternalSuccessAction) => boolean)): void {
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
