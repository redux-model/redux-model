import { Omit, OrphanRequestOptions } from '../utils/types';
import { BaseHttpService } from './BaseHttpService';
import { METHOD } from '../utils/method';
import { ActionRequest, FetchHandle } from '../../libs/types';

export class OrphanHttpServiceHandle<Response> {
  protected readonly fetchApi: BaseHttpService;
  protected readonly config: OrphanRequestOptions;
  protected method: METHOD = METHOD.get;

  constructor(config: OrphanRequestOptions, fetchApi: BaseHttpService) {
    this.config = config;
    this.fetchApi = fetchApi;
  }

  setMethod(method: METHOD): this {
    this.method = method;

    return this;
  }

  runAction(): FetchHandle<Response, never> {
    const config = this.config;
    const action: Omit<ActionRequest, 'metaKey' | 'payload' | 'onPrepare' | 'onSuccess' | 'onFail' | 'reducerName'> = {
      body: config.body || {},
      query: config.query || {},
      successText: '',
      failText: '',
      hideError: true,
      requestOptions: config.requestOptions || {},
      uri: config.uri,
      type: {
        prepare: '',
        success: '',
        fail: '',
      },
      method: this.method,
    };

    // @ts-ignore
    return this.fetchApi.runAction(action);
  }
}
