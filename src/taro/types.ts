import { request } from '@tarojs/taro';
import { ActionResponse, BaseActionRequest, Types } from '../core/utils/types';
import { METHOD } from '../core/utils/method';

export type HttpCanceler = () => void;

export type HttpError<T = any> = request.Promised<T>;

export interface FetchHandle<Response = any, Payload = any> extends Promise<ActionResponse<Response, Payload>> {
  cancel: HttpCanceler;
  type: any;
}

export interface ActionRequest<Payload = any, Type = Types> extends BaseActionRequest<Payload, Type> {
  method: METHOD.get | METHOD.post | METHOD.put | METHOD.delete | METHOD.head | METHOD.connect | METHOD.trace
  requestOptions: request.Param;
}
