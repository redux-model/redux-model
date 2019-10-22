import { AxiosInstance } from 'axios';
import { ActionRequest, FetchHandle, HttpServiceConfig } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { OrphanRequestOptions } from '../core/utils/types';

export declare class HttpService extends BaseHttpService {
  protected readonly httpHandle: AxiosInstance;
  protected readonly onRespondError: HttpServiceConfig['onRespondError'];
  protected readonly headers: HttpServiceConfig['headers'];
  protected readonly beforeSend: HttpServiceConfig['beforeSend'];
  protected readonly isSuccess: HttpServiceConfig['isSuccess'];

  constructor(config: HttpServiceConfig);

  patchAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected runAction(action: ActionRequest): FetchHandle;
}
