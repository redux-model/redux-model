import { request } from '@tarojs/taro';
import {
  ReducerAction,
  BaseActionRequest,
  BaseHttpServiceConfig,
  HttpTransform,
  Omit,
  Types
} from '../core/utils/types';
import { AxiosRequestConfig } from 'axios';

export type HttpCanceler = () => void;

export type HttpResponse<T = any> = request.Promised<T>;

export interface FetchHandle<Response = any, Payload = any> extends Promise<ReducerAction<Response, Payload>> {
  cancel: HttpCanceler;
}

export interface ActionRequest<Data = any, Response = any, Payload = any, Type = Types> extends BaseActionRequest<Data, Response, Payload, Type> {
  requestOptions: Omit<request.Param, 'url'>;
}

export interface HttpServiceConfig extends BaseHttpServiceConfig {
  onRespondError: (httpResponse: HttpResponse, transform: HttpTransform) => void;
  headers: (action: ActionRequest) => object;
  request: (params: request.Param<any>) => request.requestTask<any>;
  requestConfig?: AxiosRequestConfig;
  beforeSend?: (action: ActionRequest) => void;
  isSuccess?: (action: HttpResponse) => boolean;
  transformSuccessData?: (data: any, headers: any) => any;
}
