import { AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { ReducerAction, BaseActionRequest, BaseHttpServiceConfig, HttpTransform, Types } from '../core/utils/types';

export type HttpCanceler = Canceler;

export type HttpResponse<T = any> = AxiosResponse<T>;

export interface FetchHandle<Response = any, Payload = any> extends Promise<ReducerAction<Response, Payload>> {
  cancel: HttpCanceler;
}

export interface ActionRequest<Data = any, Response = any, Payload = any, Type = Types> extends BaseActionRequest<Data, Response, Payload, Type> {
  requestOptions: AxiosRequestConfig;
}

export interface HttpServiceConfig extends BaseHttpServiceConfig {
  onRespondError: (httpResponse: HttpResponse, transform: HttpTransform) => void;
  headers: (action: ActionRequest) => object;
  requestConfig?: AxiosRequestConfig;
  beforeSend?: (action: ActionRequest) => void;
  isSuccess?: (response: HttpResponse) => boolean;
  transformSuccessData?: (data: any, headers: any) => any;
}

export type PersistStorage = Storage;
