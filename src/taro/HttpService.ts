import Taro from '@tarojs/taro';
import { stringify } from 'qs';
import { ActionRequest, FetchHandle, HttpServiceConfig } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import {
  ActionResponseHandle,
  OrphanRequestOptions,
  HttpTransform,
} from '../core/utils/types';
import { METHOD } from '../core/utils/method';
import { OrphanHttpServiceHandle } from '../core/service/OrphanHttpServiceHandle';
import { getTaroRequest } from './getTaro';

export class HttpService extends BaseHttpService {
  protected readonly config: HttpServiceConfig;
  protected readonly request: typeof Taro.request;

  constructor(config: HttpServiceConfig) {
    super(config);

    this.config = config;
    this.request = getTaroRequest();
  }

  public connectAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.connect, this);

    return this.withThrottle(service.collect());
  }

  public traceAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    const service = new OrphanHttpServiceHandle(config, METHOD.trace, this);

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
    let url = action.uri;

    // Make sure url is not absolute link
    if (url.indexOf('://') === -1) {
      url = this.config.baseUrl + url;
    }

    if (action.query) {
      const isArg = url.indexOf('?') >= 0 ? '&' : '?';
      const args = stringify(action.query, {
        arrayFormat: 'brackets',
        encodeValuesOnly: true,
      });

      url += `${isArg}${args}`;
    }

    const requestOptions: Taro.request.Option = {
      url,
      method: action.method as any,
      ...this.config.requestConfig,
      ...action.requestOptions,
      header: {
        ...this.config.headers(action),
        ...action.requestOptions.header,
      },
    };

    // For query request, `requestOptions.data` will be considered as queryString.
    if (action.method !== METHOD.get && action.body) {
      requestOptions.data = action.body;
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
        if (response.statusCode < 200 || response.statusCode >= 300 || (this.config.isSuccess && !this.config.isSuccess(response))) {
          return Promise.reject(response);
        }

        if (this.config.transformSuccessData) {
          response.data = this.config.transformSuccessData(response.data, response.header);
        }

        // @ts-ignore
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
      .catch((error: Taro.request.SuccessCallbackResult & { errMsg?: string, status?: number }) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        let errorMessage;
        let httpStatus;
        let businessCode;

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

        // @ts-ignore
        const errorResponse: ActionResponseHandle = {
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
