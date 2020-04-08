import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ActionRequest, FetchHandle, HttpResponse, HttpServiceConfig } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { METHOD } from '../core/utils/method';
import {
  ActionResponseHandle,
  OrphanRequestOptions,
  HttpTransform,
} from '../core/utils/types';
import { OrphanHttpServiceHandle } from '../core/service/OrphanHttpServiceHandle';

export class HttpService extends BaseHttpService {
  protected readonly httpHandle: AxiosInstance;
  protected readonly config: HttpServiceConfig;

  constructor(config: HttpServiceConfig) {
    super(config);

    this.config = config;

    this.httpHandle = axios.create({
      baseURL: config.baseUrl,
      timeout: 20000,
      withCredentials: false,
      responseType: 'json',
      ...config.requestConfig,
    });
  }

  public patchAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.patch, this);

    return this.withThrottle(service.collect());
  }

  public clone(config: Partial<HttpServiceConfig>): HttpService {
    return new HttpService({
      ...this.config,
      ...config,
    });
  }

  protected runAction(action: ActionRequest): FetchHandle {
    this.config.beforeSend?.(action);
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

    this.next({
      ...action,
      type: prepare,
      effect: action.onPrepare,
    });
    const promise = this.httpHandle.request(requestOptions)
      .then((response) => {
        if (this.config.isSuccess && !this.config.isSuccess(response)) {
          return Promise.reject({
            response,
          });
        }

        if (this.config.transformSuccessData) {
          response.data = this.config.transformSuccessData(response.data, response.headers);
        }

        const okResponse: ActionResponseHandle = {
          ...action,
          type: success,
          response: response.data,
          effect: action.onSuccess,
        };

        successInvoked = true;
        this.collectResponse(okResponse);
        this.next(okResponse);
        this.triggerShowSuccess(okResponse, action.successText);

        return Promise.resolve(okResponse);
      })
      .catch((error: AxiosError) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        const isCancel = axios.isCancel(error);
        let errorMessage;
        let httpStatus;
        let businessCode;

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

        const errorResponse: ActionResponseHandle = {
          ...action,
          response: error.response || {},
          type: fail,
          message: errorMessage,
          httpStatus,
          businessCode,
          effect: action.onFail,
        };

        this.next(errorResponse);

        if (!isCancel) {
          this.triggerShowError(errorResponse, action.hideError);
        }

        return Promise.reject(errorResponse);
      });

    // @ts-ignore
    const wrapPromise = promise as FetchHandle;

    wrapPromise.cancel = source.cancel;

    return wrapPromise;
  }
}
