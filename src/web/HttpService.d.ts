import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { OrphanRequestOptions, HttpTransform, HttpServiceNoMeta, EnhanceData, EnhanceResponse, EnhancePayload, RequestActionNoMeta, HttpServiceWithMeta, RequestActionWithMeta, HttpServiceWithMetas, EnhanceMeta, RequestActionWithMetas } from '../core/utils/types';

export declare abstract class HttpService extends BaseHttpService {
  protected readonly httpHandle: AxiosInstance;
  constructor();

  patch<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionNoMeta<Data, A, Response, Payload>;
  patch<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionWithMeta<Data, A, Response, Payload>;
  patch<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(fn: A): RequestActionWithMetas<Data, A, Response, Payload, M>;
  patchAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected beforeSend(action: ActionRequest): void;

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract headers(action: ActionRequest): object;

  protected requestConfig(): AxiosRequestConfig;
}
