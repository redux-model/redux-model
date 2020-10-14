import Taro from '@tarojs/taro';
import { stringify } from 'qs';
import { BaseHttpService, HttpServiceBuilderWithMeta, PickPayload, PickResponse, HttpServiceBuilderWithMetas, PickData, PickMeta, IBaseRequestAction, BaseHttpServiceConfig, HttpTransform, METHOD, RequestSuccessAction, RequestPrepareAction, FetchHandle as SuperFetchHandle, storeHelper, RequestFailAction } from '@redux-model/core';
import PromiseListenCatch from 'promise-listen-catch';
import { RequestAction } from '../actions/RequestAction';
import { getTaro } from '../utils/getTaro';
import { parseFetch } from '../utils/parseFetch';

export type TaroRequestConfig<T = any> = Partial<Taro.request.Option<T>>;

export type HttpResponse<T = any> = Taro.request.SuccessCallbackResult<T>;

export type HttpCanceler = () => void;

export interface FetchHandle<Response = any, Payload = any> extends SuperFetchHandle<Response, Payload, HttpCanceler> {}

export interface HttpServiceConfig<ErrorData> extends BaseHttpServiceConfig {
  /**
   * Taro original config
   */
  requestOptions?: TaroRequestConfig;
  /**
   * Collect http-status, error-message and business-code to meta. And error-message will display by invoke method `onShowError`.
   *
   * ```javascript
   * {
   *   onRespondError(httpResponse, meta) {
   *     if (httpResponse.data && httpResponse.data.errMsg) {
   *       meta.message = httpResponse.data.errMsg;
   *     }
   *
   *     // If http-status is always 200 and the api put real http-status into your data.
   *     if (httpResponse.data && httpResponse.data.status) {
   *       meta.httpStatus = httpResponse.data.status;
   *     }
   *   }
   * }
   * ```
   *
   * And how to get error information in your component?
   * ```javascript
   * const meta = xModel.yAction.useMeta(); // object includes message, httpStatus, businessCode...
   * ```
   */
  onRespondError: (httpResponse: HttpResponse<ErrorData>, meta: HttpTransform) => void;
  /**
   * Transform your data globally.
   *
   * Consider that you have common struct for most api `{ data: {...} }`, you are boring to use literal `data` again and again, so you want to strip it.
   * ```javascript
   * {
   *   onRespondSuccess(httpResponse) {
   *     if (httpResponse.data.data) {
   *       httpResponse.data = httpResponse.data.data;
   *     }
   *   }
   * }
   * ```
   */
  onRespondSuccess?: (httpResponse: HttpResponse) => void;
  /**
   * Inject headers for every request.
   * ```javascript
   * import type { TokenModel } from '../../models/TokenModel';
   *
   * {
   *   headers() {
   *     const token = (require('../../models/TokenModel').tokenModel as TokenModel).data.access_token;
   *
   *     return {
   *       Authorization: `Bearer ${token}`,
   *       Accept: 'application/json',
   *       'Content-Encoding': 'application/json',
   *     };
   *   }
   * }
   * ```
   */
  headers: (action: IRequestAction) => object;
  /**
   * Before request, you can inject or modify data as your wish.
   */
  beforeSend?: (action: IRequestAction) => void;
  /**
   * When the api puts httpStatus to your data struct such as `{ status: 400, msg: ..., data: ... }`, unfortunately, we only recognize standard httpStatus. At this time, you have to judge by yourself.
   *
   * ```javascript
   * {
   *   isSuccess(httpResponse) {
   *     const status = httpResponse.data && httpResponse.data.status;
   *
   *     return status >= 200 && status < 300;
   *   }
   * }
   * ```
   */
  isSuccess?: (httpResponse: HttpResponse) => boolean;
}

export interface IRequestAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload> {
  requestOptions: TaroRequestConfig;
}

export class HttpService<ErrorData = any> extends BaseHttpService<HttpServiceConfig<ErrorData>, HttpCanceler> {
  protected readonly request: typeof Taro.request;

  constructor(config: HttpServiceConfig<ErrorData>) {
    super(config);
    this.request = getTaro().request;
  }

  public clone<NewErrorData = ErrorData>(config: Partial<HttpServiceConfig<NewErrorData>>): HttpService<NewErrorData> {
    // @ts-ignore
    // @ts-expect-error
    return new HttpService({
      ...this.config,
      ...config,
    });
  }

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMeta<Data, Response, Payload, TaroRequestConfig>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload>) & Omit<RequestAction<Data, Fn, Response, Payload, true>, 'metas' | 'loadings' | 'useMetas' | 'useLoadings'>;

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMetas<Data, Response, Payload, TaroRequestConfig, M>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>, M = PickMeta<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload>) & Omit<RequestAction<Data, Fn, Response, Payload, M>, 'meta' | 'loading' | 'useMeta' | 'useLoading'>;

  public action(fn: any): any {
    return new RequestAction(fn, this);
  }

  public/*protected*/ runAction(action: IRequestAction): FetchHandle {
    const config = this.config;

    config.beforeSend && config.beforeSend(action);

    // For service.xxxAsync(), prepare, success and fail are all empty string.
    const { prepare, success, fail } = action.type;

    const requestOptions: Taro.request.Option = {
      url: action.uri,
      method: action.method as any,
      ...config.requestOptions,
      ...action.requestOptions,
      header: {
        ...config.headers(action),
        ...action.requestOptions.header,
      },
    };

    let url = requestOptions.url;

    // Make sure url is not absolute link
    if (!~url.indexOf('://')) {
      url = config.baseUrl + url;
    }

    const throttleUrl = url;

    if (action.query) {
      const isArg = ~url.indexOf('?') ? '&' : '?';
      const args = stringify(action.query, {
        arrayFormat: 'brackets',
        encodeValuesOnly: true,
      });

      url += `${isArg}${args}`;
    }

    requestOptions.url = url;

    // For GET request, `requestOptions.data` will convert to queryString.
    if (action.method !== METHOD.get && action.body) {
      requestOptions.data = action.body;
    }

    prepare && storeHelper.dispatch<RequestPrepareAction>({
      ...action,
      type: prepare,
      loading: true,
      effect: action.onPrepare,
      after: action.afterPrepare,
      afterDuration: action.afterPrepareDuration,
    });

    const throttleData = this.getThrottleData(action, {
      url: throttleUrl,
      actionName: action.actionName,
      method: action.method,
      body: action.body,
      query: action.query,
      headers: requestOptions.header!,
      transfer: action.throttle.transfer,
    });

    if (throttleData) {
      return throttleData;
    }

    let successInvoked = false;
    let canceler: HttpCanceler | undefined;
    let fetchAbort: AbortController | undefined;

    // H5 fetch() doesn't support abort
    if (process.env.TARO_ENV === 'h5' && typeof AbortController === 'function') {
      fetchAbort = new AbortController();
      // @ts-ignore
      requestOptions.signal = fetchAbort.signal;
      // Be careful to keep scope
      canceler = fetchAbort.abort.bind(fetchAbort);
    }

    const task = this.request(requestOptions);

    // H5 fetch() doesn't support abort
    if (!canceler && task.abort) {
      canceler = task.abort.bind(task);
    }

    const promise = task
      .then((httpResponse) => {
        if (httpResponse.statusCode < 200 || httpResponse.statusCode >= 300 || (config.isSuccess && !config.isSuccess(httpResponse))) {
          return Promise.reject(httpResponse);
        }

        if (config.onRespondSuccess) {
          config.onRespondSuccess(httpResponse);
        }

        const okAction: RequestSuccessAction = {
          ...action,
          type: success,
          loading: false,
          response: httpResponse.data,
          effect: action.onSuccess,
          after: action.afterSuccess,
          afterDuration: action.afterSuccessDuration,
        };

        successInvoked = true;
        success && storeHelper.dispatch(okAction);
        this.setThrottle(okAction);
        this.triggerShowSuccess(okAction, action.successText);

        return Promise.resolve(okAction);
      })
      .catch((error: Taro.request.SuccessCallbackResult & { status?: number } & Response) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        // H5     ok => statusCode | error => status
        // Weapp  ok => statusCode | error => statusCode
        // ...
        if (error.status && !error.statusCode) {
          error.statusCode = error.status;
        }

        /**
         * H5 throws original response when fail.
         * @see ./node_modules/@tarojs/taro-h5/src/api/request/index.js
         **/
        if (error.statusCode && !error.hasOwnProperty('data')) {
          return new Promise((_, reject) => {
            parseFetch(requestOptions, error).then((data) => {
              error.data = data;
              reject(error);
            });
          });
        }

        return Promise.reject(error);
      })
      .catch((error: Taro.request.SuccessCallbackResult) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        const errMsg = error.errMsg;
        let isCancel: boolean = false;
        let errorMessage: string;
        let httpStatus: number | undefined;
        let businessCode: string | undefined;

        if (
          // @ts-ignore
          (fetchAbort && error.name === 'AbortError')
          ||
          (errMsg && /abort/i.test(errMsg))
        ) {
          isCancel = true;
        }

        if (isCancel) {
          errorMessage = 'Aborted';
        } else if (error.statusCode) {
          const meta: HttpTransform = {
            httpStatus: error.statusCode,
          };

          config.onRespondError(error, meta);
          errorMessage = action.failText || meta.message || 'Fail to fetch api';
          httpStatus = meta.httpStatus;
          businessCode = meta.businessCode;
        } else {
          errorMessage = 'Fail to request api';

          if (errMsg) {
            if (/timeout/i.test(errMsg)) {
              errorMessage = config.timeoutMessage ? config.timeoutMessage(errMsg): errMsg;
            } else if (/fail/i.test(errMsg)) {
              errorMessage = config.networkErrorMessage ? config.networkErrorMessage(errMsg) : errMsg;
            }
          }
        }

        const errorResponse: RequestFailAction = {
          ...action,
          response: error.data,
          type: fail,
          loading: false,
          message: errorMessage,
          httpStatus,
          businessCode,
          effect: action.onFail,
          after: action.afterFail,
          afterDuration: action.afterFailDuration,
        };

        fail && storeHelper.dispatch(errorResponse);

        if (!isCancel) {
          this.triggerShowError(errorResponse, action.hideError);
        }

        if (listener.canReject()) {
          return Promise.reject(errorResponse);
        }

        return;
      });

    const listener = new PromiseListenCatch(promise);
    // @ts-ignore
    const fakePromise: FetchHandle<any, any> = listener;
    fakePromise.cancel = canceler || (() => {});

    return fakePromise;
  }
}
