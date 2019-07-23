import { request } from '@tarojs/taro';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { HTTP_STATUS_CODE } from '../core/utils/httpStatusCode';
import { ActionRequest } from './types';

interface FailTransform {
    httpStatus?: HTTP_STATUS_CODE;
    errorMessage?: string;
    businessCode?: string;
}

export declare const createRequestMiddleware: <RootState = any>(config: {
    id: string;
    baseUrl: string;
    // import { request } from '@tarojs/taro';
    // request: request
    request: (OBJECT: request.Param<any>) => request.requestTask<any>;
    requestConfig?: request.Param<any>;
    onInit?: ((api: MiddlewareAPI<Dispatch, RootState>, action: ActionRequest) => void);
    getHeaders: (api: MiddlewareAPI<Dispatch, RootState>) => object;
    onFail: (error: request.Promised<any>, transform: FailTransform) => void;
    onShowSuccess: (message: string) => void;
    onShowError: (message: string) => void;
}) => Middleware<{}, RootState, Dispatch>;
