import { request } from '@tarojs/taro';
import { stringify } from 'qs';
import { ActionRequest, FetchHandle, HttpServiceConfig } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import {
  InternalActionHandle,
  OrphanRequestOptions,
  HttpTransform,
} from '../core/utils/types';
import { METHOD } from '../core/utils/method';
import { OrphanHttpServiceHandle } from '../core/service/OrphanHttpServiceHandle';

export class HttpService extends BaseHttpService {
  protected readonly onRespondError: HttpServiceConfig['onRespondError'];
  protected readonly headers: HttpServiceConfig['headers'];
  protected readonly beforeSend: HttpServiceConfig['beforeSend'];
  protected readonly isSuccess: HttpServiceConfig['isSuccess'];
  protected readonly request: HttpServiceConfig['request'];
  protected readonly requestConfig: HttpServiceConfig['requestConfig'];

  private readonly config: HttpServiceConfig;

  constructor(config: HttpServiceConfig) {
    super(config);

    this.config = config;
    this.onRespondError = config.onRespondError;
    this.headers = config.headers;
    this.beforeSend = config.beforeSend;
    this.isSuccess = config.isSuccess;
    this.request = config.request;
    this.requestConfig = config.requestConfig;
  }

  public connectAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.connect)
      .runAction();
  }

  public traceAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.trace)
      .runAction();
  }

  public clone(config: Partial<HttpServiceConfig>): HttpService {
    return new HttpService({
      ...this.config,
      ...config,
    });
  }

  protected runAction(action: ActionRequest): FetchHandle {
    this.beforeSend && this.beforeSend(action);

    const { prepare, success, fail } = action.type;
    let url = action.uri;

    // Make sure url is not absolute link
    if (url.indexOf('://') === -1) {
      url = this.baseUrl + url;
    }

    const requestOptions: request.Param = {
      url,
      method: action.method as any,
      ...this.requestConfig,
      ...action.requestOptions,
      header: {
        ...this.headers(action),
        ...action.requestOptions.header,
      },
    };

    if (action.method === METHOD.get) {
      requestOptions.data = action.query;
    } else {
      requestOptions.data = action.body;

      if (action.query) {
        const isArg = requestOptions.url.includes('?') ? '' : '?';

        requestOptions.url += `${isArg}${stringify(action.query)}`;
      }
    }

    this.next({
      ...action,
      type: prepare,
      effect: action.onPrepare,
    });

    const task = this.request(requestOptions);
    const canceler = task.abort;
    let successInvoked = false;

    const promise = task
      .then((response) => {
        if (response.statusCode < 200 || response.statusCode >= 300 || (this.isSuccess && !this.isSuccess(response))) {
          return Promise.reject(response);
        }

        // @ts-ignore
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
      .catch((error: request.Promised & { errMsg: string }) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        let errorMessage;
        let httpStatus;
        let businessCode;

        if (error.statusCode) {
          const transform: HttpTransform = {
            httpStatus: error.statusCode,
          };

          this.onRespondError(error, transform);
          errorMessage = action.failText || transform.message || 'Fail to fetch api';
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = 'Fail to request api';

          if (error.errMsg && /timeout/i.test(error.errMsg)) {
            errorMessage = this.timeoutMessage ? this.timeoutMessage(error.errMsg): error.errMsg;
          } else if (error.errMsg && /fail/i.test(error.errMsg)) {
            errorMessage = this.networkErrorMessage ? this.networkErrorMessage(error.errMsg) : error.errMsg;
          }
        }

        // @ts-ignore
        const errorResponse: InternalActionHandle = {
          ...action,
          response: error.data || {},
          type: fail,
          message: errorMessage,
          httpStatus,
          businessCode,
          effect: action.onFail,
        };

        this.next(errorResponse);

        this.triggerShowError(errorResponse, action.hideError);

        return Promise.reject(errorResponse);
      });

    // @ts-ignore
    const wrapPromise = promise as FetchHandle;

    wrapPromise.cancel = canceler;

    return wrapPromise;
  }
}
