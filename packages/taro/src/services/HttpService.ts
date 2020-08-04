import Taro from '@tarojs/taro';
import { stringify } from 'qs';
import { BaseHttpService, HttpServiceBuilderWithMeta, PickPayload, PickResponse, HttpServiceBuilderWithMetas, PickData, PickMeta, IBaseRequestAction, BaseHttpServiceConfig, HttpTransform, METHOD, RequestSuccessAction, RequestPrepareAction, FetchHandle as SuperFetchHandle, storeHelper, RequestFailAction } from '@redux-model/core';
import { RequestAction } from '../actions/RequestAction';
import { getTaro } from '../utils/getTaro';

export type TaroRequestConfig<T = any> = Partial<Taro.request.Option<T>>;

export type HttpResponse<T = any> = Taro.request.SuccessCallbackResult<T>;

export type HttpCanceler = () => void;

export interface FetchHandle<Response = any, Payload = any> extends SuperFetchHandle<Response, Payload, HttpCanceler> {}

export interface HttpServiceConfig<ErrorData> extends BaseHttpServiceConfig {
  requestConfig?: TaroRequestConfig;
  onRespondError: (httpResponse: HttpResponse<ErrorData>, transform: HttpTransform) => void;
  headers: (action: IRequestAction) => object;
  beforeSend?: (action: IRequestAction) => void;
  isSuccess?: (response: HttpResponse) => boolean;
  transformSuccessData?: (data: any, headers: any) => any;
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
    return new RequestAction(fn, this.uniqueId);
  }

  protected runAction(action: IRequestAction): Promise<any> {
    this.config.beforeSend?.(action);

    // For service.xxxAsync(), prepare and fail is empty string.
    const { prepare, success, fail } = action.type;

    const requestOptions: Taro.request.Option = {
      url: action.uri,
      method: action.method as any,
      ...this.config.requestConfig,
      ...action.requestOptions,
      header: {
        ...this.config.headers(action),
        ...action.requestOptions.header,
      },
    };

    let url = requestOptions.url;

    // Make sure url is not absolute link
    if (url.indexOf('://') === -1) {
      url = this.config.baseUrl + url;
    }

    const throttleUrl = url;

    if (action.query) {
      const isArg = url.indexOf('?') >= 0 ? '&' : '?';
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
      modelName: action.modelName,
      successType: success,
      method: action.method,
      body: action.body,
      query: action.query,
      headers: requestOptions.header || {},
      transfer: action.throttleTransfer,
    });

    if (throttleData) {
      return throttleData;
    }

    const task = this.request(requestOptions);
    const canceler = task.abort;
    let successInvoked = false;

    const promise = task
      .then((response) => {
        if (response.statusCode < 200 || response.statusCode >= 300 || (this.config.isSuccess && !this.config.isSuccess(response))) {
          return Promise.reject(response);
        }

        if (this.config.transformSuccessData) {
          response.data = this.config.transformSuccessData(response.data, response.header);
        }

        const okAction: RequestSuccessAction = {
          ...action,
          type: success,
          loading: false,
          response: response.data,
          effect: action.onSuccess,
          after: action.afterSuccess,
          afterDuration: action.afterSuccessDuration,
        };

        successInvoked = true;
        success && storeHelper.dispatch(okAction);
        this.storeThrottle(okAction);
        this.triggerShowSuccess(okAction, action.successText);

        return Promise.resolve(okAction);
      })
      .catch((error: Taro.request.SuccessCallbackResult & { errMsg?: string, status?: number }) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        let errorMessage: string;
        let httpStatus: number | undefined;
        let businessCode: string | undefined;

        // H5     ok => statusCode | error => status
        // Weapp  ok => statusCode | error => statusCode
        // ...
        if (error.statusCode || error.status) {
          const transform: HttpTransform = {
            httpStatus: error.statusCode || error.status,
          };

          this.config.onRespondError(error, transform);
          errorMessage = action.failText || transform.message || 'Fail to fetch api';
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = 'Fail to request api';

          if (error.errMsg && /timeout/i.test(error.errMsg)) {
            errorMessage = this.config.timeoutMessage ? this.config.timeoutMessage(error.errMsg): error.errMsg;
          } else if (error.errMsg && /fail/i.test(error.errMsg)) {
            errorMessage = this.config.networkErrorMessage ? this.config.networkErrorMessage(error.errMsg) : error.errMsg;
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
        this.triggerShowError(errorResponse, action.hideError);

        return Promise.reject(errorResponse);
      });

    // @ts-ignore
    // @ts-expect-error
    const fakePromise = promise as FetchHandle<any, any, HttpCanceler>;
    fakePromise.cancel = canceler;

    return fakePromise;
  }
}
