import {
  HttpServiceWithMeta,
  HttpServiceWithMetas,
  RequestOptions,
  Types,
  ReducerAction,
} from '../utils/types';
import { ActionRequest } from '../../libs/types';

export class HttpServiceBuilder<Data, Response, Payload = unknown, M = true> {
  protected readonly config: RequestOptions<Data, Response, Payload>;

  protected types: Types = {
    prepare: '',
    success: '',
    fail: '',
  };

  constructor(config: RequestOptions<Data, Response, Payload>) {
    this.config = config;
  }

  query(query: object): this {
    this.config.query = query;

    return this;
  }

  body(body: object): this {
    this.config.body = body;

    return this;
  }

  successText(text: string): this {
    this.config.successText = text;

    return this;
  }

  failText(text: string): this {
    this.config.failText = text;

    return this;
  }

  requestOptions(options: ActionRequest['requestOptions']): this {
    this.config.requestOptions = options;

    return this;
  }

  hideError(is: boolean | ((response: ReducerAction<Response, Payload>) => boolean)): this {
    this.config.hideError = is;

    return this;
  }

  cache(millSeconds: number, useCache: boolean = true): this {
    this.config.useCache = useCache;
    this.config.cacheMillSeconds = millSeconds;

    return this;
  }

  payload<T extends Payload>(payload: T): M extends true
    ? HttpServiceWithMeta<Data, Response, T>
    : HttpServiceWithMetas<Data, Response, T, M>
  {
    this.config.payload = payload;

    // @ts-ignore
    return this;
  }

  // @ts-ignore
  metas(value: string): HttpServiceWithMetas<Data, Response, Payload, string>;
  metas(value: number): HttpServiceWithMetas<Data, Response, Payload, number>;
  metas(value: symbol): HttpServiceWithMetas<Data, Response, Payload, symbol>;

  metas(param: string | number | symbol): HttpServiceBuilder<Data, Response, Payload, M> {
    this.config.metaKey = param;

    return this;
  };

  onPrepare(fn: NonNullable<ActionRequest<Data, Response, Payload>['onPrepare']>): this {
    this.config.onPrepare = fn;

    return this;
  }

  onSuccess(fn: NonNullable<ActionRequest<Data, Response, Payload>['onSuccess']>): this {
    this.config.onSuccess = fn;

    return this;
  }

  onFail(fn: NonNullable<ActionRequest<Data, Response, Payload>['onFail']>): this {
    this.config.onFail = fn;

    return this;
  }

  collect(types: Types): ActionRequest {
    const config = this.config;
    const action: ActionRequest = {
      uri: config.uri,
      type: types,
      method: config.method,
      reducerName: config.instanceName,
      payload: config.payload === undefined ? {} : config.payload,
      body: config.body || {},
      query: config.query || {},
      successText: config.successText || '',
      failText: config.failText || '',
      hideError: config.hideError || false,
      requestOptions: config.requestOptions || {},
      metaKey: config.metaKey === undefined ? true : config.metaKey,
      onPrepare: config.onPrepare || null,
      onSuccess: config.onSuccess || null,
      onFail: config.onFail || null,
      useCache: config.useCache || false,
      cacheMillSeconds: config.cacheMillSeconds || 0,
      cacheKey: '',
    };

    return action;
  }
}
