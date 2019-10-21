import {
  Business,
  EnhanceData,
  EnhanceMeta,
  EnhancePayload,
  EnhanceResponse,
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
  action<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionNoMeta<Data, A, Response, Payload>;
  action<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionWithMeta<Data, A, Response, Payload>;
  action<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(fn: A): RequestActionWithMetas<Data, A, Response, Payload, M>;

  getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  deleteAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected timeoutMessage(originalMessage: string): string;
  protected networkErrorMessage(originalMessage: string): string;
  protected abstract baseUrl(): string;
  protected abstract onShowSuccess(successText: string, action: Business): void;
  protected abstract onShowError(errorText: string, action: Business): void;
}
