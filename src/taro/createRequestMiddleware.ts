import { request } from '@tarojs/taro';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { HTTP_STATUS_CODE } from '../core/utils/httpStatusCode';
import { stringify } from 'qs';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { ActionResponse } from '../core/utils/types';
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
  requestConfig?: request.Param;
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

    const requestOptions: request.Param = {
      url: action.uri,
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

        requestOptions.url += `${requestOptions.url}${isArg}${stringify(action.query)}`;
      }
    }

    next({ ...action, type: prepare });

    const task = request(requestOptions);
    const canceler = task.abort;

    const promise = task
      .then((response) => {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          return Promise.reject(response);
        }

        const okResponse: ActionResponse = {
          ...action,
          payload: action.payload,
          type: success,
          response: response.data,
        };

        next(okResponse);

        if (action.successText) {
          config.onShowSuccess(action.successText);
        }

        return Promise.resolve(okResponse);
      })
      .catch((error: request.Promised) => {
        let errorMessage;
        let httpStatus;
        let businessCode;

        if (error.statusCode) {
          const transform: FailTransform = {
            httpStatus: error.statusCode,
          };

          config.onFail(error.data as HttpError, transform);
          errorMessage = transform.errorMessage;
          httpStatus = transform.httpStatus;
          businessCode = transform.businessCode;
        } else {
          errorMessage = 'Fail to request.';
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
          config.onShowError(errorMessage);
        }

        return Promise.reject(errorResponse);
      });

    const wrapPromise = promise as FetchHandle;

    wrapPromise.cancel = canceler;
    // It's required when you want to use dispatch() method
    wrapPromise.type = '_______required_______';

    return wrapPromise;
  };

  return middleware;
};
