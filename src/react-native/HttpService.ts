import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { METHOD } from '../core/utils/method';
import {
  ActionResponse,
  OrphanRequestOptions,
  HttpTransform,
  HttpServiceNoMeta,
  EnhanceData,
  EnhanceResponse,
  EnhancePayload,
  RequestActionNoMeta,
  HttpServiceWithMeta,
  RequestActionWithMeta, HttpServiceWithMetas, EnhanceMeta, RequestActionWithMetas
} from '../core/utils/types';
import { OrphanHttpServiceHandle } from '../core/service/OrphanHttpServiceHandle';

export abstract class HttpService extends BaseHttpService {
  protected readonly httpHandle: AxiosInstance;

  constructor() {
    super();
    this.httpHandle = axios.create({
      baseURL: this.baseUrl(),
      timeout: 20000,
      withCredentials: false,
      responseType: 'json',
      ...this.requestConfig(),
    });
  }

  public patch<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  public patch<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public patch<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public patch(fn: any): any {
    return this.actionRequest(fn, METHOD.patch);
  }

  public patchAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.patch)
      .runAction();
  }

  // @ts-ignore
  protected beforeSend(action: ActionRequest) {};

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract headers(action: ActionRequest): object;

  protected requestConfig(): AxiosRequestConfig {
    return {};
  }

  public runAction(action: ActionRequest): FetchHandle {
    this.beforeSend(action);
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

    this._next({
      ...action,
      type: prepare,
      effect: action.onPrepare,
    });
    const promise = this.httpHandle.request(requestOptions)
      .then((response) => {
        // @ts-ignore
        const okResponse: ActionResponse = {
          ...action,
          type: success,
          response: response.data,
          effect: action.onSuccess,
        };

        successInvoked = true;
        this._next(okResponse);

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
        } else if (error.request && error.response) {
          const transform: HttpTransform = {
            httpStatus: error.response.status,
          };

          this.onRespondError(error as HttpError, transform);
          errorMessage = action.failText || transform.errorMessage || 'Fail to request api';
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = error.message;

          if (/^timeout\sof\s\d+m?s\sexceeded$/i.test(errorMessage)) {
            errorMessage = this.timeoutMessage(errorMessage);
          } else if (/Network\sError/i.test(errorMessage)) {
            errorMessage = this.networkErrorMessage(errorMessage);
          }
        }

        // @ts-ignore
        const errorResponse: ActionResponse = {
          ...action,
          response: error.response || {},
          type: fail,
          errorMessage,
          httpStatus,
          businessCode,
          effect: action.onFail,
        };

        this._next(errorResponse);

        if (!isCancel) {
          this._triggerShowError(errorResponse, action.hideError);
        }

        return Promise.reject(errorResponse);
      });

    const wrapPromise = promise as FetchHandle;

    wrapPromise.cancel = source.cancel;

    return wrapPromise;
  }
}
