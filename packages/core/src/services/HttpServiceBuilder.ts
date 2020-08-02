import { IResponseAction, BaseRequestAction, IBaseRequestAction } from '../actions/BaseRequestAction';
import { METHOD } from '../utils/method';
import { ThrottleKeyOption } from './BaseHttpService';

type Options<Data, Response, Payload> = Partial<Omit<IBaseRequestAction<Data, Response, Payload>, 'type'>> & {
  uri: string;
  instanceName: string;
  method: METHOD;
};

export type ThrottleOptions = {
  /**
   * Millisecond
   *
   * `1000`  means 1 second
   * `60000` means 1 minute
   */
  duration: number;
  enable?: boolean;
  transfer?: ThrottleKeyOption['transfer'];
};

export class HttpServiceBuilder<Data, Response, Payload = unknown, RequestOption extends object = object, M = true> {
  protected readonly config: Options<Data, Response, Payload>;

  constructor(config: Options<Data, Response, Payload>) {
    this.config = config;
  }

  public query(query: object): this {
    this.config.query = query;

    return this;
  }

  public body(body: object): this {
    this.config.body = body;

    return this;
  }

  public successText(text: string): this {
    this.config.successText = text;

    return this;
  }

  public failText(text: string): this {
    this.config.failText = text;

    return this;
  }

  public requestOptions(options: RequestOption): this {
    this.config.requestOptions = options;

    return this;
  }

  public hideError(is: boolean | ((response: IResponseAction<Response, Payload>) => boolean)): this {
    this.config.hideError = is;

    return this;
  }

  public throttle(options: ThrottleOptions): this {
    this.config.useThrottle = options.enable !== false;
    this.config.throttleMillSeconds = options.duration;
    this.config.throttleTransfer = options.transfer;

    return this;
  }

  public payload<T>(payload: T): M extends true
    ? HttpServiceBuilderWithMeta<Data, Response, T, RequestOption, true>
    : HttpServiceBuilderWithMetas<Data, Response, T, RequestOption, M>
  {
    // @ts-ignore
    // @ts-expect-error
    this.config.payload = payload;
    // @ts-ignore
    // @ts-expect-error
    return this;
  }

  public metas(value: string): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, string>;
  public metas(value: number): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, number>;
  public metas(value: symbol): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, symbol>;
  public metas(value: string | number | symbol): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, string | number | symbol> {
    this.config.metaKey = value;

    // @ts-ignore
    // @ts-expect-error
    return this;
  };

  public onPrepare(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['onPrepare']>): this {
    this.config.onPrepare = fn;

    return this;
  }

  public afterPrepare(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['afterPrepare']>, duration?: number): this {
    this.config.afterPrepare = fn;
    this.config.afterPrepareDuration = duration;

    return this;
  }

  public onSuccess(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['onSuccess']>): this {
    this.config.onSuccess = fn;

    return this;
  }

  public afterSuccess(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['afterSuccess']>, duration?: number): this {
    this.config.afterSuccess = fn;
    this.config.afterSuccessDuration = duration;

    return this;
  }

  public onFail(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['onFail']>): this {
    this.config.onFail = fn;

    return this;
  }

  public afterFail(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['afterFail']>, duration?: number): this {
    this.config.afterFail = fn;
    this.config.afterFailDuration = duration;

    return this;
  }

  public/*protected*/ collect(instance: BaseRequestAction<Data, any, any, any, any>): IBaseRequestAction<Data, Response, Payload> {
    const config = this.config;
    const action: IBaseRequestAction = {
      uniqueId: instance.uniqueId,
      uri: config.uri,
      type: {
        prepare: instance.getPrepareType(),
        success: instance.getSuccessType(),
        fail: instance.getFailType(),
      },
      method: config.method,
      modelName: config.instanceName,
      payload: config.payload,
      body: config.body || {},
      query: config.query || {},
      successText: config.successText || '',
      failText: config.failText || '',
      hideError: config.hideError || false,
      requestOptions: config.requestOptions || {},
      metaKey: config.metaKey === undefined ? true : config.metaKey,
      metaActionName: instance.getName(),
      onPrepare: config.onPrepare || null,
      afterPrepare: config.afterPrepare || null,
      afterPrepareDuration: config.afterPrepareDuration,
      onSuccess: config.onSuccess || null,
      afterSuccess: config.afterSuccess || null,
      afterSuccessDuration: config.afterSuccessDuration,
      onFail: config.onFail || null,
      afterFail: config.afterFail || null,
      afterFailDuration: config.afterFailDuration,
      useThrottle: config.useThrottle || false,
      throttleMillSeconds: config.throttleMillSeconds || 0,
      throttleKey: '',
      throttleTransfer: config.throttleTransfer || null,
    };

    return action;
  }
}

export declare class HttpServiceBuilderWithMeta<Data, Response, Payload, RequestOption extends object, M = true> extends HttpServiceBuilder<Data, Response, Payload, RequestOption, M> {
  private readonly _: string;
}

export declare class HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption extends object, M> extends HttpServiceBuilder<Data, Response, Payload, RequestOption, M> {
  private readonly _: string;
}
