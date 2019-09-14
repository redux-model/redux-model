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
  // Do it like this:
  // import { request } from '@tarojs/taro';
  // request: request
  request: (params: request.Param<any>) => request.requestTask<any>;
  requestConfig?: Omit<request.Param, 'url'>;
  onInit?: ((api: MiddlewareAPI<Dispatch, RootState>, action: ActionRequest) => void);
  getHeaders: (api: MiddlewareAPI<Dispatch, RootState>) => object;
  onFail: (error: HttpError, transform: FailTransform) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}) => Middleware<{}, RootState, Dispatch>;
