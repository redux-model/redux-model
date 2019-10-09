import { request } from '@tarojs/taro';
import { stringify } from 'qs';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { ActionResponse, OrphanRequestOptions, HttpTransform, Omit, RequestOptions } from '../core/utils/types';
import { METHOD } from '../core/utils/method';
import { HttpServiceHandle } from '../core/service/HttpServiceHandle';
import { OrphanHttpServiceHandle } from '../core/service/OrphanHttpServiceHandle';

export abstract class HttpService extends BaseHttpService {
  public connect<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.connect);
  }

  public connectAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.connect)
      .runAction();
  }

  public trace<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.trace);
  }

  public traceAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.trace)
      .runAction();
  }

  // @ts-ignore
  protected beforeSend(action: ActionRequest) {};

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract headers(action: ActionRequest): object;

  protected abstract request(): (params: request.Param<any>) => request.requestTask<any>;

  protected requestConfig(): Omit<request.Param, 'url'> {
    return {};
  }

  public runAction(action: ActionRequest): FetchHandle {
    this.beforeSend(action);

    const { prepare, success, fail } = action.type;
    let url = action.uri;

    // Make sure url is not absolute link
    if (url.indexOf('://') === -1) {
      url = this.baseUrl() + url;
    }

    const requestOptions: request.Param = {
      url,
      method: action.method,
      ...this.requestConfig(),
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

    this._next({ ...action, type: prepare });

    const task = this.request()(requestOptions);
    const canceler = task.abort;
    let successInvoked = false;

    const promise = task
      .then((response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return Promise.reject(response);
        }

        // @ts-ignore
        const okResponse: ActionResponse = {
          ...action,
          type: success,
          response: response.data,
        };

        successInvoked = true;
        this._next(okResponse);

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
          errorMessage = action.failText || transform.errorMessage || 'Fail to fetch api';
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = 'Fail to request api';

          if (error.errMsg && /timeout/i.test(error.errMsg)) {
            errorMessage = this.timeoutMessage(error.errMsg);
          } else if (error.errMsg && /fail/i.test(error.errMsg)) {
            errorMessage = this.networkErrorMessage(error.errMsg);
          }
        }

        // @ts-ignore
        const errorResponse: ActionResponse = {
          ...action,
          response: error.data || {},
          type: fail,
          errorMessage,
          httpStatus,
          businessCode,
        };

        this._next(errorResponse);

        this._triggerShowError(errorResponse, action.hideError);

        return Promise.reject(errorResponse);
      });

    const wrapPromise = promise as FetchHandle;

    wrapPromise.cancel = canceler;

    return wrapPromise;
  }
}
