import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ActionRequest, FetchHandle, HttpResponse, HttpServiceConfig } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { METHOD } from '../core/utils/method';
import {
  InternalActionHandle,
  OrphanRequestOptions,
  HttpTransform,
} from '../core/utils/types';
import { OrphanHttpServiceHandle } from '../core/service/OrphanHttpServiceHandle';

export class HttpService extends BaseHttpService {
  protected readonly httpHandle: AxiosInstance;
  protected readonly onRespondError: HttpServiceConfig['onRespondError'];
  protected readonly headers: HttpServiceConfig['headers'];
  protected readonly beforeSend: HttpServiceConfig['beforeSend'];
  protected readonly isSuccess: HttpServiceConfig['isSuccess'];

  constructor(config: HttpServiceConfig) {
    super(config);

    this.onRespondError = config.onRespondError;
    this.headers = config.headers;
    this.beforeSend = config.beforeSend;
    this.isSuccess = config.isSuccess;

    this.httpHandle = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      withCredentials: false,
      responseType: 'json',
      ...config.requestConfig,
    });
  }

  public patchAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.patch)
      .runAction();
  }

  protected runAction(action: ActionRequest): FetchHandle {
    this.beforeSend && this.beforeSend(action);
    const { prepare, success, fail } = action.type;
    const source = axios.CancelToken.source();
    const requestOptions: AxiosRequestConfig = {
      url: action.uri,
      params: action.query,
      cancelToken: source.token,
      method: action.method as AxiosRequestConfig['method'],
      ...action.requestOptions,
      headers: {
        ...this.headers(action),
        ...action.requestOptions.headers,
      },
    };
    let successInvoked = false;
    if ([METHOD.post, METHOD.put, METHOD.delete, METHOD.patch].includes(action.method)) {
      requestOptions.data = action.body;
    }

    this.next({
      ...action,
      type: prepare,
      effect: action.onPrepare,
    });
    const promise = this.httpHandle.request(requestOptions)
      .then((response) => {
        if (this.isSuccess && !this.isSuccess(response)) {
          return Promise.reject({
            response,
          });
        }

        const okResponse: InternalActionHandle = {
          ...action,
          type: success,
          response: response.data,
          effect: action.onSuccess,
        };

        successInvoked = true;
        this.next(okResponse);

        if (action.successText) {
          this.onShowSuccess(action.successText, okResponse);
        }

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

          this.onRespondError(error.response as HttpResponse, transform);
          errorMessage = action.failText || transform.message || 'Fail to request api';
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = error.message;

          if (/^timeout\sof\s\d+m?s\sexceeded$/i.test(errorMessage)) {
            errorMessage = this.timeoutMessage ? this.timeoutMessage(errorMessage) : errorMessage;
          } else if (/Network\sError/i.test(errorMessage)) {
            errorMessage = this.networkErrorMessage ? this.networkErrorMessage(errorMessage) : errorMessage;
          }
        }

        const errorResponse: InternalActionHandle = {
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
