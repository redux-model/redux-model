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
  protected readonly config: HttpServiceConfig;

  constructor(config: HttpServiceConfig) {
    super(config);

    this.config = config;
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
    this.config.beforeSend && this.config.beforeSend(action);

    const { prepare, success, fail } = action.type;
    let url = action.uri;

    // Make sure url is not absolute link
    if (url.indexOf('://') === -1) {
      url = this.config.baseUrl + url;
    }

    const requestOptions: request.Param = {
      url,
      method: action.method as any,
      ...this.config.requestConfig,
      ...action.requestOptions,
      header: {
        ...this.config.headers(action),
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

    const task = this.config.request(requestOptions);
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
          this.config.onShowSuccess(action.successText, okResponse);
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
