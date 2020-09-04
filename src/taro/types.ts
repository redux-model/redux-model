import * as Taro from '@tarojs/taro';
import {
  ReducerAction,
  BaseActionRequest,
  BaseHttpServiceConfig,
  HttpTransform,
  Omit,
  Types
} from '../core/utils/types';

export type HttpCanceler = () => void;

export type HttpResponse<T = any> = Taro.request.SuccessCallbackResult<T>;

export interface FetchHandle<Response = any, Payload = any> extends Promise<ReducerAction<Response, Payload>> {
  cancel: HttpCanceler;
}

export interface ActionRequest<Data = any, Response = any, Payload = any, Type = Types> extends BaseActionRequest<Data, Response, Payload, Type> {
  requestOptions: Omit<Taro.request.Option, 'url'>;
}

export interface HttpServiceConfig extends BaseHttpServiceConfig {
  onRespondError: (httpResponse: HttpResponse, transform: HttpTransform) => void;
  headers: (action: ActionRequest) => object;
  requestConfig?: Omit<Taro.request.Option, 'url'>;
  beforeSend?: (action: ActionRequest) => void;
  isSuccess?: (response: HttpResponse) => boolean;
  transformSuccessData?: (data: any, headers: any) => any;
}

export type PersistStorage = typeof Taro;
