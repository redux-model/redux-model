import { AxiosRequestConfig } from 'axios';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { HTTP_STATUS_CODE } from '../core/utils/httpStatusCode';
import { ActionRequest, HttpError } from './types';

interface FailTransform {
    httpStatus?: HTTP_STATUS_CODE;
    errorMessage?: string;
    businessCode?: string;
}

export declare const createRequestMiddleware: <RootState = any>(config: {
    id: string;
    baseUrl: string;
    axiosConfig?: AxiosRequestConfig;
    onInit?: ((api: MiddlewareAPI<Dispatch, RootState>, action: ActionRequest) => void);
    getTimeoutMessage?: () => string;
    getHeaders: (api: MiddlewareAPI<Dispatch, RootState>) => object;
    onFail: (error: HttpError, transform: FailTransform) => void;
    onShowSuccess: (message: string) => void;
    onShowError: (message: string) => void;
}) => Middleware<{}, RootState, Dispatch>;
