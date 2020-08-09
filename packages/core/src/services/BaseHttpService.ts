import { HttpServiceBuilderWithMeta, HttpServiceBuilderWithMetas, HttpServiceBuilder } from './HttpServiceBuilder';
import { IResponseAction, BaseRequestAction, IBaseRequestAction, RequestSuccessAction, RequestFailAction } from '../actions/BaseRequestAction';
import cloneDeep from 'clone';
import { OrphanHttpService, OrphanRequestOptions } from './OrphanHttpService';
import { METHOD } from '../utils/method';
import { storeHelper } from '../stores/StoreHelper';

export interface FetchHandle<Response = any, Payload = any, CancelFn = () => void> extends Promise<IResponseAction<Response, Payload>> {
  cancel: CancelFn;
}

export type PickData<T> = T extends (...args: any[]) => HttpServiceBuilder<infer Data, any, any, any, any> ? Data : never;
export type PickResponse<T> = T extends (...args: any[]) => HttpServiceBuilderWithMeta<any, infer Response, any, any, any>
  ? Response
  : T extends (...args: any[]) => HttpServiceBuilderWithMetas<any, infer Response, any, any, any>
    ? Response
    : never;
export type PickPayload<T> = T extends (...args: any[]) => HttpServiceBuilderWithMeta<any, any, infer Payload, any, any>
  ? Payload
  : T extends (...args: any[]) => HttpServiceBuilderWithMetas<any, any, infer Payload, any, any>
    ? Payload
    : unknown;
export type PickMeta<T> = T extends (...args: any[]) => HttpServiceBuilderWithMetas<any, any, any, any, infer M> ? M : never;

export interface BaseHttpServiceConfig {
  baseUrl: string;
  requestConfig?: object;
  onShowSuccess: (successText: string, action: IResponseAction) => void;
  onShowError: (errorText: string, action: IResponseAction) => void;
  timeoutMessage?: (originalText: string) => string;
  networkErrorMessage?: (originalText: string) => string;
  throttleTransfer?: NonNullable<ThrottleKeyOption['transfer']>,
}

export interface ThrottleKeyOption {
  modelName: string;                        // determine model
  successType: string;                      // determine action
  url: string;                              // params like: /user/2/post/3
  method: METHOD;                           // low compat, user always use the same method
  body: Record<string, any>;                // condition
  query: Record<string, any>;               // condition
  headers: Record<string, any>;             // condition, especially token
  transfer: null | ((options: Omit<ThrottleKeyOption, 'transfer'>) => void | Omit<ThrottleKeyOption, 'transfer'>);
}

export abstract class BaseHttpService<T extends BaseHttpServiceConfig, CancelFn> {
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
  }

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMeta<Data, Response, Payload, any>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload, CancelFn>) & Omit<BaseRequestAction<Data, Fn, Response, Payload, true>, 'metas' | 'loadings'>;

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMetas<Data, Response, Payload, any, M>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>, M = PickMeta<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload, CancelFn>) & Omit<BaseRequestAction<Data, Fn, Response, Payload, M>, 'meta' | 'loading'>;

  public action(fn: any): any {
    return new BaseRequestAction(fn, this);
  }

  public getAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, unknown, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.get);

    return this.runAction(service.collect());
  }

  public postAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, unknown, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.post);

    return this.runAction(service.collect());
  }

  public putAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, unknown, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.put);

    return this.runAction(service.collect());
  }

  public deleteAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, unknown, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.delete);

    return this.runAction(service.collect());
  }

  public patchAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, unknown, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.patch);

    return this.runAction(service.collect());
  }

  public connectAsync<Response>(config: OrphanRequestOptions<T['requestConfig']>): FetchHandle<Response, unknown, CancelFn> {
    const service = new OrphanHttpService(config, METHOD.connect);

    return this.runAction(service.collect());
  }

  protected generateThrottleKey(options: ThrottleKeyOption): string {
    const { transfer, ...rest } = options;

    if (transfer || this.config.throttleTransfer) {
      let cloneObj = cloneDeep(rest);

      [this.config.throttleTransfer, transfer].forEach((runner) => {
        if (runner) {
          const tmp = runner(cloneObj);

          if (tmp !== undefined) {
            cloneObj = tmp;
          }
        }
      });

      return JSON.stringify(cloneObj);
    }

    return JSON.stringify(rest);
  }

  protected getThrottleData(action: IBaseRequestAction, throttleKeyOption: ThrottleKeyOption): FetchHandle | void {
    const actionName = action.type.success;
    const cacheData = this.caches[actionName];

    if (!action.throttle.enable) {
      if (cacheData) {
        cacheData[this.generateThrottleKey(throttleKeyOption)] = undefined;
      }

      return;
    } // end

    const throttleKey = this.generateThrottleKey(throttleKeyOption);
    const item = cacheData?.[throttleKey];

    action.throttle.key = throttleKey;

    if (item && Date.now() <= item.timestamp) {
      const promise = new Promise((resolve) => {
        const fakeOkAction: RequestSuccessAction = {
          ...action,
          loading: false,
          type: action.type.success,
          response: cloneDeep(item.response, false),
          effect: action.onSuccess,
          after: action.afterSuccess,
          afterDuration: action.afterSuccessDuration,
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

    return;
  }

  protected storeThrottle(action: RequestSuccessAction) {
    const throttle = action.throttle;

    if (throttle.enable) {
      const type = action.type;

      this.caches[type] = this.caches[type] || {};
      this.caches[type]![throttle.key] = {
        timestamp: Date.now() + throttle.duration,
        response: cloneDeep(action.response, false),
      };
    }
  }

  public/*protected*/ clearThrottle(successType: string): void {
    this.caches[successType] = undefined;
  }

  public/*protected*/ abstract runAction(action: IBaseRequestAction): FetchHandle<any, any, any>;

  protected triggerShowSuccess(okResponse: RequestSuccessAction, successText: string): void {
    if (successText) {
      this.config.onShowSuccess(successText, okResponse);
    }
  }

  protected triggerShowError(errorResponse: RequestFailAction, hideError: boolean | ((response: RequestFailAction) => boolean)): void {
    if (!errorResponse.message) {
      return;
    }

    const showError = typeof hideError === 'boolean'
      ? !hideError
      : !hideError(errorResponse);

    if (showError) {
      this.config.onShowError(errorResponse.message, errorResponse);
    }
  }
}
