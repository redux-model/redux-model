import axios, { AxiosRequestConfig, AxiosResponse, Canceler, AxiosInstance, AxiosError } from 'axios';
import { BaseHttpService, HttpServiceBuilderWithMeta, PickPayload, PickResponse, HttpServiceBuilderWithMetas, PickData, PickMeta, IBaseRequestAction, BaseHttpServiceConfig, HttpTransform, METHOD, InternalSuccessAction, InternalPrepareAction, FetchHandle as SuperFetchHandle, storeHelper } from '../core';
import { RequestAction } from '../actions/RequestAction';

export type HttpResponse<T = any> = AxiosResponse<T>;

export type HttpCanceler = Canceler;

export interface FetchHandle<Response = any, Payload = any> extends SuperFetchHandle<Response, Payload, HttpCanceler> {}

export interface HttpServiceConfig extends BaseHttpServiceConfig {
  requestConfig?: AxiosRequestConfig;
  onRespondError: (httpResponse: HttpResponse, transform: HttpTransform) => void;
  headers: (action: IRequestAction) => object;
  beforeSend?: (action: IRequestAction) => void;
  isSuccess?: (response: HttpResponse) => boolean;
  transformSuccessData?: (data: any, headers: any) => any;
}

export interface IRequestAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload> {
  requestOptions: AxiosRequestConfig;
}

export class HttpService extends BaseHttpService<HttpServiceConfig, HttpCanceler> {
  protected readonly httpHandler: AxiosInstance;

  constructor(config: HttpServiceConfig) {
    super(config);

    this.httpHandler = axios.create({
      baseURL: config.baseUrl,
      timeout: 20000,
      withCredentials: false,
      responseType: 'json',
      ...config.requestConfig,
    });
  }

  public clone(config: Partial<HttpServiceConfig>): HttpService {
    return new HttpService({
      ...this.config,
      ...config,
    });
  }

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMeta<Data, Response, Payload, AxiosRequestConfig>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload>) & Omit<RequestAction<Data, Fn, Response, Payload, true>, 'metas' | 'loadings' | 'useMetas' | 'useLoadings'>;

  public action<Fn extends (...args: any[]) => HttpServiceBuilderWithMetas<Data, Response, Payload, AxiosRequestConfig, M>, Data = PickData<Fn>, Response = PickResponse<Fn>, Payload = PickPayload<Fn>, M = PickMeta<Fn>>(
    fn: Fn
  ): ((...args: Parameters<Fn>) => FetchHandle<Response, Payload>) & Omit<RequestAction<Data, Fn, Response, Payload, M>, 'meta' | 'loading' | 'useMeta' | 'useLoading'>;

  public action(fn: any): any {
    return new RequestAction(fn, this.uniqueId);
  }

  protected runAction(action: IRequestAction): Promise<any> {
    this.config.beforeSend?.(action);

    // For service.xxxAsync(), prepare and fail is empty string.
    const { prepare, success, fail } = action.type;
    const source = axios.CancelToken.source();
    const requestOptions: AxiosRequestConfig = {
      url: action.uri,
      params: action.query,
      cancelToken: source.token,
      method: action.method as AxiosRequestConfig['method'],
      ...action.requestOptions,
      headers: {
        ...this.config.headers(action),
        ...action.requestOptions.headers,
      },
    };

    if (action.method !== METHOD.get && action.body) {
      requestOptions.data = action.body;
    }

    let successInvoked = false;

    prepare && storeHelper.dispatch<InternalPrepareAction>({
      ...action,
      type: prepare,
      loading: true,
      effect: action.onPrepare,
    });

    const promise = this.httpHandler.request(requestOptions)
      .then((response) => {
        if (this.config.isSuccess && !this.config.isSuccess(response)) {
          return Promise.reject({
            response,
          });
        }

        if (this.config.transformSuccessData) {
          response.data = this.config.transformSuccessData(response.data, response.headers);
        }

        const okAction: InternalSuccessAction = {
          ...action,
          type: success,
          loading: false,
          response: response.data,
          effect: action.onSuccess,
        };

        successInvoked = true;
        success && storeHelper.dispatch(okAction);
        this.triggerShowSuccess(okAction, action.successText);

        return Promise.resolve(okAction);
      })
      .catch((error: AxiosError) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        const isCancel = axios.isCancel(error);
        let errorMessage: string;
        let httpStatus: number | undefined;
        let businessCode: string | undefined;

        if (isCancel) {
          errorMessage = error.message || 'Abort';
        } else if (error.response) {
          const transform: HttpTransform = {
            httpStatus: error.response.status,
          };

          this.config.onRespondError(error.response as HttpResponse, transform);
          errorMessage = action.failText || transform.message || 'Fail to request api';
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = error.message;

          if (/^timeout\sof\s\d+m?s\sexceeded$/i.test(errorMessage)) {
            errorMessage = this.config.timeoutMessage ? this.config.timeoutMessage(errorMessage) : errorMessage;
          } else if (/Network\sError/i.test(errorMessage)) {
            errorMessage = this.config.networkErrorMessage ? this.config.networkErrorMessage(errorMessage) : errorMessage;
          }
        }

        const errorResponse: InternalSuccessAction = {
          ...action,
          response: error.response,
          type: fail,
          loading: false,
          message: errorMessage,
          httpStatus,
          businessCode,
          effect: action.onFail,
        };

        fail && storeHelper.dispatch(errorResponse);

        if (!isCancel) {
          this.triggerShowError(errorResponse, action.hideError);
        }

        return Promise.reject(errorResponse);
      });

    // @ts-ignore
    // @ts-expect-error
    const fakePromise = promise as FetchHandle<any, any, HttpCanceler>;
    fakePromise.cancel = source.cancel;

    return fakePromise;
  }
}
