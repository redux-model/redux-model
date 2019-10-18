import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ActionRequest, FetchHandle, HttpError } from './types';
import { BaseHttpService } from '../core/service/BaseHttpService';
import { OrphanRequestOptions, HttpTransform } from '../core/utils/types';

export declare abstract class HttpService extends BaseHttpService {
  protected readonly httpHandle: AxiosInstance;
  constructor();

  patchAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never>;

  protected beforeSend(action: ActionRequest): void;

  protected abstract onRespondError(error: HttpError, transform: HttpTransform): void;

  protected abstract headers(action: ActionRequest): object;

  protected requestConfig(): AxiosRequestConfig;
}
