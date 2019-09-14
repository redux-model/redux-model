import { request } from '@tarojs/taro';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { HTTP_STATUS_CODE } from '../core/utils/httpStatusCode';
import { stringify } from 'qs';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { ActionResponse, Omit } from '../core/utils/types';
import { METHOD } from '../core/utils/method';

interface FailTransform {
  httpStatus?: HTTP_STATUS_CODE;
  errorMessage?: string;
  businessCode?: string;
}

type MixedReturn = FetchHandle | ActionRequest;

export const createRequestMiddleware = <RootState = any>(config: {
  id: string;
  baseUrl: string;
  request: (params: request.Param<any>) => request.requestTask<any>;
  requestConfig?: Omit<request.Param, 'url'>;
  onInit?: (api: MiddlewareAPI<Dispatch, RootState>, action: ActionRequest) => void;
  getHeaders: (api: MiddlewareAPI<Dispatch, RootState>) => object;
  onFail: (error: HttpError, transform: FailTransform) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}) => {

  const middleware: Middleware<{}, RootState> = (api) => (next) => (action: ActionRequest): MixedReturn => {
    if (action.middleware !== config.id) {
      return next(action);
    }

    if (config.onInit) {
      config.onInit(api, action);
    }

    const { prepare, success, fail } = action.type;
    let url = action.uri;

    // Make sure url is not absolute link
    if (url.indexOf('://') === -1) {
      url = config.baseUrl + url;
    }

    const requestOptions: request.Param = {
      url,
      method: action.method,
      ...config.requestConfig,
      ...action.requestOptions,
      header: {
        ...config.getHeaders(api),
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

    next({ ...action, type: prepare });

    const task = config.request(requestOptions);
    const canceler = task.abort;
    let successInvoked = false;

    const promise = task
      .then((response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return Promise.reject(response);
        }

        const okResponse: ActionResponse = {
          ...action,
          payload: action.payload,
          type: success,
          response: response.data,
        };

        successInvoked = true;
        next(okResponse);

        if (action.successText) {
          config.onShowSuccess(action.successText);
        }

        return Promise.resolve(okResponse);
      })
      .catch((error: request.Promised) => {
        if (successInvoked) {
          return Promise.reject(error);
        }

        let errorMessage;
        let httpStatus;
        let businessCode;

        if (error.statusCode) {
          const transform: FailTransform = {
            httpStatus: error.statusCode,
          };

          config.onFail(error, transform);
          errorMessage = transform.errorMessage;
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = 'Fail to request.';
        }

        if (!errorMessage) {
          errorMessage = action.failText || 'Fail to fetch api';
        }

        const errorResponse: ActionResponse = {
          ...action,
          payload: action.payload,
          response: error.data || {},
          type: fail,
          errorMessage,
          httpStatus,
          businessCode,
        };

        next(errorResponse);

        let showError: boolean;

        if (typeof action.hideError === 'boolean') {
          showError = !action.hideError;
        } else {
          showError = !action.hideError(errorResponse);
        }

        if (showError) {
          config.onShowError(action.failText || errorMessage);
        }

        return Promise.reject(errorResponse);
      });

    const wrapPromise = promise as FetchHandle;

    wrapPromise.cancel = canceler;

    return wrapPromise;
  };

  return middleware;
};
