import { request } from '@tarojs/taro';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { OrphanRequestOptions, HttpTransform, Omit, HttpServiceNoMeta, EnhanceData, EnhanceResponse, EnhancePayload, RequestActionNoMeta, HttpServiceWithMeta, RequestActionWithMeta, HttpServiceWithMetas, EnhanceMeta, RequestActionWithMetas } from '../core/utils/types';

export declare abstract class HttpService extends BaseHttpService {
  connect<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionNoMeta<Data, A, Response, Payload>;
  connect<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionWithMeta<Data, A, Response, Payload>;
  connect<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(fn: A): RequestActionWithMetas<Data, A, Response, Payload, M>;
  connectAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  trace<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionNoMeta<Data, A, Response, Payload>;
  trace<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionWithMeta<Data, A, Response, Payload>;
  trace<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(fn: A): RequestActionWithMetas<Data, A, Response, Payload, M>;
  traceAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected beforeSend(action: ActionRequest): void;

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract headers(action: ActionRequest): object;

  protected abstract request(): (params: request.Param<any>) => request.requestTask<any>;

  protected requestConfig(): Omit<request.Param, 'url'>;
}
