import {
  EnhanceData,
  EnhanceMeta,
  EnhancePayload,
  EnhanceResponse,
  BaseHttpServiceConfig,
  HttpServiceWithMeta,
  HttpServiceWithMetas,
  OrphanRequestOptions,
  RequestActionWithMeta,
  RequestActionWithMetas,
  ActionResponseHandle,
} from '../utils/types';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { AnyAction } from 'redux';

export declare abstract class BaseHttpService {
  protected readonly config: BaseHttpServiceConfig;

  constructor(config: BaseHttpServiceConfig);

  action<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(fn: A): RequestActionWithMeta<Data, A, Response, Payload>;
  action<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(fn: A): RequestActionWithMetas<Data, A, Response, Payload, M>;

  getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;
  deleteAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected abstract runAction(action: any): any;

  protected getCacheKey(action: ActionRequest | ActionResponseHandle): string;
  protected withCache<Response, Payload>(action: ActionRequest): FetchHandle<Response, Payload>;
  protected collectResponse(action: ActionResponseHandle): void;

  protected next(action: AnyAction): void;
  protected triggerShowSuccess(okResponse: ActionResponseHandle, successText: string): void;
  protected triggerShowError(errorResponse: ActionResponseHandle, hideError: boolean | ((response: ActionResponseHandle) => boolean)): void;
}
