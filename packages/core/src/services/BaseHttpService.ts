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
  /**
   * The common url prefix.
   * @example http://api.com
   * @example http://api.com/api
   */
  baseUrl: string;
  requestOptions?: object;
  /**
   * Display your success message to the screen. It only happens when you specific the successText in action.
   * ```javascript
   * $api.action((data) => {
   *    return this
   *      .post('/api')
   *      .body(data)
   *      .successText('Created');
   * });
   * ```
   * And in service
   * ```javascript
   * {
   *   onShowSuccess(message) {
   *     alert(message);
   *   }
   * }
   * ```
   */
  onShowSuccess: (successText: string, action: IResponseAction) => void;
  /**
   * Display your error message to the screen.
   * ```javascript
   * {
   *   onShowError(message) {
   *     alert(message);
   *   }
   * }
   * ```
   */
  onShowError: (errorText: string, action: IResponseAction) => void;
  /**
   * Collect error message for request timeout.
   */
  timeoutMessage?: (originalText: string) => string;
  /**
   * Collect error message for network is unavailable.
   */
  networkErrorMessage?: (originalText: string) => string;
  /**
   * Control the throttle token
   * {
   *  throttleTransfer(options) {
   *    delete options.query.__timestamp__;
   *  }
   * }
   */
  throttleTransfer?: NonNullable<ThrottleKeyOption['transfer']>,
}

export interface ThrottleKeyOption {
  actionName: string;                       // determine model and action
  url: string;                              // params like: /user/2/post/3
  method: METHOD;                           // low compat, user always use the same method
  body: Record<string, any>;                // condition
  query: Record<string, any>;               // condition
  headers: Record<string, any>;             // condition, especially token
  transfer?: (options: Omit<ThrottleKeyOption, 'transfer'>) => void | Omit<ThrottleKeyOption, 'transfer'>;
}

export abstract class BaseHttpService<T extends BaseHttpServiceConfig, CancelFn> {
  protected readonly config: T;

  protected caches: Partial<{
    [actionName: string]: Partial<{
      [throttleKey: string]: {
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

  public getAsync<Response>(config: OrphanRequestOptions<T['requestOptions']>): FetchHandle<Response, unknown, CancelFn> {
    return this.runService(config, METHOD.get);
  }

  public postAsync<Response>(config: OrphanRequestOptions<T['requestOptions']>): FetchHandle<Response, unknown, CancelFn> {
    return this.runService(config, METHOD.post);
  }

  public putAsync<Response>(config: OrphanRequestOptions<T['requestOptions']>): FetchHandle<Response, unknown, CancelFn> {
    return this.runService(config, METHOD.put);
  }

  public deleteAsync<Response>(config: OrphanRequestOptions<T['requestOptions']>): FetchHandle<Response, unknown, CancelFn> {
    return this.runService(config, METHOD.delete);
  }

  public patchAsync<Response>(config: OrphanRequestOptions<T['requestOptions']>): FetchHandle<Response, unknown, CancelFn> {
    return this.runService(config, METHOD.patch);
  }

  public connectAsync<Response>(config: OrphanRequestOptions<T['requestOptions']>): FetchHandle<Response, unknown, CancelFn> {
    return this.runService(config, METHOD.connect);
  }

  protected runService(config: OrphanRequestOptions<T['requestOptions']>, method: METHOD) {
    const service = new OrphanHttpService(config, method);
    return this.runAction(service.collect());
  }

  protected generateThrottleKey(options: ThrottleKeyOption): string {
    const { transfer, ...rest } = options;
    const { throttleTransfer: globalTransfer } = this.config;
    let cloneObj = rest;

    if (globalTransfer || transfer) {
      cloneObj = cloneDeep(rest);
      cloneObj = globalTransfer && globalTransfer(cloneObj) || cloneObj;
      cloneObj = transfer && transfer(cloneObj) || cloneObj;
    }

    return JSON.stringify(cloneObj);
  }

  protected getThrottleData(action: IBaseRequestAction, throttleKeyOption: ThrottleKeyOption): FetchHandle | void {
    // actionName includes model-name and action-name.
    const cacheData = this.caches[action.actionName];

    if (!action.throttle.enable) {
      if (cacheData) {
        cacheData[this.generateThrottleKey(throttleKeyOption)] = undefined;
      }

      return;
    } // end

    const throttleKey = this.generateThrottleKey(throttleKeyOption);
    const item = cacheData && cacheData[throttleKey];

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
      }) as FetchHandle;

      promise.cancel = () => {};
      return promise;
    } // end

    if (item) {
      cacheData![throttleKey] = undefined;
    }

    return;
  }

  protected setThrottle(action: RequestSuccessAction) {
    const throttle = action.throttle;

    if (throttle.enable) {
      const name = action.actionName;

      this.caches[name] = this.caches[name] || {};
      this.caches[name]![throttle.key] = {
        timestamp: Date.now() + throttle.duration,
        response: cloneDeep(action.response, false),
      };
    }
  }

  public clearThrottle(): void;
  public clearThrottle(actionName: string): void;
  public clearThrottle(actionName?: string): void {
    if (actionName) {
      this.caches[actionName] = undefined;
    } else {
      this.caches = {};
    }
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
