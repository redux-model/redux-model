import {
  EnhanceData,
  EnhanceMeta,
  EnhancePayload,
  EnhanceResponse,
  BaseHttpServiceConfig,
  HttpServiceNoMeta,
  HttpServiceWithMeta,
  HttpServiceWithMetas,
  OrphanRequestOptions,
  RequestActionNoMeta,
  RequestActionWithMeta,
  RequestActionWithMetas,
} from '../utils/types';
import { FetchHandle } from '../../libs/types';

export declare abstract class BaseHttpService {
  constructor(config: BaseHttpServiceConfig);

  action<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionNoMeta<Data, A, Response, Payload>;
  action<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionWithMeta<Data, A, Response, Payload>;
  action<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(fn: A): RequestActionWithMetas<Data, A, Response, Payload, M>;

  getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  deleteAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected abstract runAction(action: any): any;
}
