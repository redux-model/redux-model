import { AxiosError, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { ActionResponse, BaseActionRequest, Types } from '../core/utils/types';
import { METHOD } from '../core/utils/method';

export type HttpCanceler = Canceler;

export interface HttpError<T = any> extends AxiosError {
  response: AxiosResponse<T>;
}

export interface FetchHandle<Response = any, Payload = any> extends Promise<ActionResponse<Response, Payload>> {
  cancel: HttpCanceler;
}

export interface ActionRequest<Payload = any, Type = Types> extends BaseActionRequest<Payload, Type> {
  method: METHOD.get | METHOD.post | METHOD.put | METHOD.delete | METHOD.head | METHOD.patch;
  requestOptions: AxiosRequestConfig;
}
