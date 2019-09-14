import { request } from '@tarojs/taro';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { HTTP_STATUS_CODE } from '../core/utils/httpStatusCode';
import { ActionRequest, HttpError } from './types';
import { Omit } from '../core/utils/types';

interface FailTransform {
  httpStatus?: HTTP_STATUS_CODE;
  errorMessage?: string;
  businessCode?: string;
}

export declare const createRequestMiddleware: <RootState = any>(config: {
  id: string;
  baseUrl: string;
  getHeaders: (api: MiddlewareAPI<Dispatch, RootState>) => object;
  // Method `onRespondError` does not work for network-error and timeout-error
  // In that case, consider providing config `timeoutMessage` and `networkErrorMessage`
  onRespondError: (error: HttpError, transform: FailTransform) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
  // Do it like this:
  // import { request } from '@tarojs/taro';
  // request: request
  request: (params: request.Param<any>) => request.requestTask<any>;
  onInit?: ((api: MiddlewareAPI<Dispatch, RootState>, action: ActionRequest) => void);
  requestConfig?: Omit<request.Param, 'url'>;
  timeoutMessage?: string;
  networkErrorMessage?: string;
}) => Middleware<{}, RootState, Dispatch>;
