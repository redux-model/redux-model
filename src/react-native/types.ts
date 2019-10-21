import { AxiosError, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { ActionResponse, BaseActionRequest, Types } from '../core/utils/types';

export type HttpCanceler = Canceler;

export interface HttpError<T = any> extends AxiosError {
  response: AxiosResponse<T>;
}

export interface FetchHandle<Response = any, Payload = any> extends Promise<ActionResponse<Response, Payload>> {
  cancel: HttpCanceler;
}

export interface ActionRequest<Data = any, Response = any, Payload = any, Type = Types> extends BaseActionRequest<Data, Response, Payload, Type> {
  requestOptions: AxiosRequestConfig;
}
