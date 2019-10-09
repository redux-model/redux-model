import { RequestOptions, Types } from '../utils/types';
import { BaseHttpService } from './BaseHttpService';
import { METHOD } from '../utils/method';
import { ActionRequest } from '../../libs/types';

export class HttpServiceHandle<Response, Payload> {
  protected readonly fetchApi: BaseHttpService;
  protected readonly config: RequestOptions<Response, Payload>;

  protected method: METHOD = METHOD.get;
  protected types: Types = {
    prepare: '',
    success: '',
    fail: '',
  };

  constructor(config: RequestOptions<Response, Payload>, fetchApi: BaseHttpService) {
    this.config = config;
    this.fetchApi = fetchApi;
  }

  setMethod(method: METHOD): this {
    this.method = method;

    return this;
  }

  setTypes(types: Types): this {
    this.types = types;

    return this;
  }

  runAction() {
    const config = this.config;
    const action: ActionRequest = {
      payload: config.payload === undefined ? {} : config.payload,
      body: config.body || {},
      query: config.query || {},
      successText: config.successText || '',
      failText: config.failText || '',
      hideError: config.hideError || false,
      requestOptions: config.requestOptions || {},
      uri: config.uri.getUri(),
      type: this.types,
      // @ts-ignore
      method: this.method,
    };

    return this.fetchApi.runAction(action);
  }
}
