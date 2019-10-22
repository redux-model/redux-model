import { ActionRequest, FetchHandle, HttpServiceConfig } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { OrphanRequestOptions } from '../core/utils/types';

export declare class HttpService extends BaseHttpService {
  constructor(config: HttpServiceConfig);

  connectAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  traceAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected runAction(action: ActionRequest): FetchHandle;
}
