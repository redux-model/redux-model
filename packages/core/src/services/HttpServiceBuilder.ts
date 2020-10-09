import { IResponseAction, IBaseRequestAction, Types } from '../actions/BaseRequestAction';
import { METHOD } from '../utils/method';
import { ThrottleKeyOption } from './BaseHttpService';

interface Graphql {
  variables: object,
  query: string
};

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

  /**
   * Query String on url.
   */
  public query(query: object): this {
    this.config.query = query;

    return this;
  }

  /**
   * The data you want to send.
   */
  public body(body: object): this {
    this.config.body = body;

    return this;
  }

  /**
   * Graphql template instead of body
   *
   * @see https://github.com/redux-model/graphql
   *
   * ```javascript
   * this.post('/graphql').graphql({
   *   query: `...template...`,
   *   variables: { ... },
   * });
   * ```
   */
  public graphql(tpl: ((args: object) => Graphql) | Graphql): this {
    let data = typeof tpl === 'function' ? tpl({}) : tpl;

    if (this.config.method === METHOD.get) {
      this.query(data);
    } else {
      this.body(data);
    }

    return this;
  }

  /**
   * The message for successful request.
   *
   * ```typescript
   * const $api = new HttpService({
   *   onShowSuccess(message) {
   *     alert(message);
   *   }
   * });
   * ```
   */
  public successText(text: string): this {
    this.config.successText = text;

    return this;
  }

  /**
   * The message for error request.
   *
   * ```typescript
   * const $api = new HttpService({
   *   onShowError(message) {
   *     alert(message);
   *   }
   * });
   * ```
   */
  public failText(text: string): this {
    this.config.failText = text;

    return this;
  }

  public requestOptions(options: RequestOption): this {
    this.config.requestOptions = options;

    return this;
  }

  /**
   * Don't show error message for this request. Default `false`, we will always show error message.
   */
  public hideError(is: boolean | ((response: IResponseAction<unknown, Payload>) => boolean)): this {
    this.config.hideError = is;

    return this;
  }

  /**
   * Use cache data to interrupt request. Consider to use it only for get method.
   *
   * ```javascript
   * this.get('/user').throttle({
   *   // The cache expire after 10 seconds.
   *   duration: 10000,
   * });
   * ```
   */
  public throttle(options: ThrottleOptions): this {
    this.config.throttle = {
      enable: options.duration > 0 && options.enable !== false,
      duration: options.duration,
      transfer: options.transfer,
      key: '',
    };

    return this;
  }

  /**
   * The payload for model.subscriptions()
   *
   * ```javascript
   * class AModel extends Model {
   *   getUser = $api.action((id: number) => {
   *     return this.get(`/users/${id}`).payload({ id });
   *   });
   * }
   *
   * const aModel = new AModel();
   *
   * ---------
   *
   * class BModel extends Model {
   *   protected subscriptions(): Subscriptions<Data> {
   *     return [
   *       aModel.getUser.onSuccess((state, action) => {
   *         // action.payload.id
   *       }).
   *     ];
   *   }
   * }
   * ```
   */
  public payload<T>(payload: T): M extends true
    ? HttpServiceBuilderWithMeta<Data, Response, T, RequestOption, true>
    : HttpServiceBuilderWithMetas<Data, Response, T, RequestOption, M>
  {
    // @ts-ignore
    this.config.payload = payload;
    // @ts-ignore
    return this;
  }

  /**
   * Collect meta for each request
   *
   * ```javascript
   * class TestModel extends Model {
   *   getUser = $api.action((id: number) => {
   *      return this.get('/user').metas(id);
   *   });
   * }
   *
   * const testModel = new TestModel();
   *
   * -------
   *
   * testModel.getUser.metas.pick(1);
   * testModel.getUser.loadings.pick(1);
   * testModel.getUser.useMetas(1);
   * testModel.getUser.useMetas().pick(1);
   * testModel.getUser.useLoadings(1);
   * testModel.getUser.useLoadings().pick(1);
   * ```
   */
  public metas(value: string): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, string>;
  public metas(value: number): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, number>;
  public metas(value: symbol): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, symbol>;
  public metas(value: string | number | symbol): HttpServiceBuilderWithMetas<Data, Response, Payload, RequestOption, string | number | symbol> {
    this.config.metaKey = value;

    // @ts-ignore
    return this;
  };

  /**
   * Change state before send
   */
  public onPrepare(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['onPrepare']>): this {
    this.config.onPrepare = fn;

    return this;
  }

  /**
   * Dispatch more action before send
   */
  public afterPrepare(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['afterPrepare']>, duration?: number): this {
    this.config.afterPrepare = fn;
    this.config.afterPrepareDuration = duration;

    return this;
  }

  /**
   * Change state when request success
   */
  public onSuccess(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['onSuccess']>): this {
    this.config.onSuccess = fn;

    return this;
  }

  /**
   * Dispatch more action when request success
   */
  public afterSuccess(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['afterSuccess']>, duration?: number): this {
    this.config.afterSuccess = fn;
    this.config.afterSuccessDuration = duration;

    return this;
  }

  /**
   * Change state when request fail
   */
  public onFail(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['onFail']>): this {
    this.config.onFail = fn;

    return this;
  }

  /**
   * Dispatch more action when request fail
   */
  public afterFail(fn: NonNullable<IBaseRequestAction<Data, Response, Payload>['afterFail']>, duration?: number): this {
    this.config.afterFail = fn;
    this.config.afterFailDuration = duration;

    return this;
  }

  public/*protected*/ collect(actionName: string, types: Types): IBaseRequestAction<Data, Response, Payload> {
    const config = this.config;
    const action: IBaseRequestAction = {
      uri: config.uri,
      type: types,
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
      actionName,
      onPrepare: config.onPrepare,
      afterPrepare: config.afterPrepare,
      afterPrepareDuration: config.afterPrepareDuration,
      onSuccess: config.onSuccess,
      afterSuccess: config.afterSuccess,
      afterSuccessDuration: config.afterSuccessDuration,
      onFail: config.onFail,
      afterFail: config.afterFail,
      afterFailDuration: config.afterFailDuration,
      throttle: config.throttle || {
        enable: false,
        duration: 0,
        transfer: undefined,
        key: '',
      },
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
