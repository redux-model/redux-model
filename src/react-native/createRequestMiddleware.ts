import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { HTTP_STATUS_CODE } from '../core/utils/httpStatusCode';
import { METHOD } from '../core/utils/method';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { ActionResponse } from '../core/utils/types';

interface FailTransform {
  httpStatus?: HTTP_STATUS_CODE;
  errorMessage?: string;
  businessCode?: string;
}

type MixedReturn = FetchHandle | ActionRequest;

export const createRequestMiddleware = <RootState = any>(config: {
  id: string;
  baseUrl: string;
  requestConfig?: AxiosRequestConfig;
  onInit?: (api: MiddlewareAPI<Dispatch, RootState>, action: ActionRequest) => void;
  getTimeoutMessage?: () => string;
  getHeaders: (api: MiddlewareAPI<Dispatch, RootState>) => object;
  onFail: (error: HttpError, transform: FailTransform) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}) => {
  const httpHandle = axios.create({
    baseURL: config.baseUrl,
    timeout: 20000,
    withCredentials: false,
    responseType: 'json',
    ...config.requestConfig,
  });

  const middleware: Middleware<{}, RootState> = (api) => (next) => (action: ActionRequest): MixedReturn => {
    if (action.middleware !== config.id) {
      return next(action);
    }

    if (config.onInit) {
      config.onInit(api, action);
    }

    const { prepare, success, fail } = action.type;
    const source = axios.CancelToken.source();
    const requestOptions: AxiosRequestConfig = {
      url: action.uri,
      params: action.query,
      cancelToken: source.token,
      method: action.method,
      ...action.requestOptions,
      headers: {
        ...config.getHeaders(api),
        ...action.requestOptions.headers,
      },
    };

    if ([METHOD.post, METHOD.put, METHOD.delete, METHOD.patch].includes(action.method)) {
      requestOptions.data = action.body;
    }

    next({ ...action, type: prepare });
    const promise = httpHandle.request(requestOptions)
        .then((response) => {
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
        .catch((error: AxiosError) => {
          const isCancel = axios.isCancel(error);
          let errorMessage;
          let httpStatus;
          let businessCode;

          if (isCancel) {
            errorMessage = error.message;
          } else if (error.request && error.response) {
            const transform: FailTransform = {
              httpStatus: error.response.status,
            };

            config.onFail(error as HttpError, transform);
            errorMessage = transform.errorMessage;
            httpStatus = transform.httpStatus;
            businessCode = transform.businessCode;
          } else {
            errorMessage = error.message;
          }

          if (config.getTimeoutMessage && /^timeout\sof\s\d+m?s\sexceeded$/i.test(errorMessage)) {
            errorMessage = config.getTimeoutMessage();
          }

          const errorResponse: ActionResponse = {
            ...action,
            payload: action.payload,
            response: error.response || {},
            type: fail,
            errorMessage,
            httpStatus,
            businessCode,
          };

          next(errorResponse);

          if (!isCancel) {
            let showError: boolean;

            if (typeof action.hideError === 'boolean') {
              showError = !action.hideError;
            } else {
              showError = !action.hideError(errorResponse);
            }

            if (showError) {
              config.onShowError(errorMessage);
            }
          }

          return Promise.reject(errorResponse);
        });

    const wrapPromise = promise as FetchHandle;

    wrapPromise.cancel = source.cancel;
    // It's required when you want to use dispatch() method
    wrapPromise.type = '_______required_______';

    return wrapPromise;
  };

  return middleware;
};
