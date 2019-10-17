import { request } from '@tarojs/taro';
import { ActionResponse, BaseActionRequest, Omit, Types } from '../core/utils/types';

export type HttpCanceler = () => void;

export type HttpError<T = any> = request.Promised<T>;

export interface FetchHandle<Response = any, Payload = any> extends Promise<ActionResponse<any, Response, Payload>> {
  cancel: HttpCanceler;
}

export interface ActionRequest<Data = any, Response = any, Payload = any, Type = Types> extends BaseActionRequest<Data, Response, Payload, Type> {
  requestOptions: Omit<request.Param, 'url'>;
}
