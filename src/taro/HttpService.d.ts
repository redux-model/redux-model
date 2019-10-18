import { request } from '@tarojs/taro';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { OrphanRequestOptions, HttpTransform, Omit, HttpServiceNoMeta, EnhanceData, EnhanceResponse, EnhancePayload, RequestActionNoMeta, HttpServiceWithMeta, RequestActionWithMeta, HttpServiceWithMetas, EnhanceMeta, RequestActionWithMetas } from '../core/utils/types';

export declare abstract class HttpService extends BaseHttpService {
  connectAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  traceAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected beforeSend(action: ActionRequest): void;

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract headers(action: ActionRequest): object;

  protected abstract request(): (params: request.Param<any>) => request.requestTask<any>;

  protected requestConfig(): Omit<request.Param, 'url'>;
}
