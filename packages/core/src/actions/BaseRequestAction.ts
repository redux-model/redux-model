import { IActionPayload } from './BaseAction';
import { getCurrentModel } from '../utils/model';
import { metaReducer, Metas, MetasLoading, IMetaAction } from '../reducers/MetaReducer';
import { State, StateReturn } from '../models/BaseModel';
import { HTTP_STATUS_CODE } from '../utils/httpStatusCode';
import { HttpServiceBuilder } from '../services/HttpServiceBuilder';
import { METHOD } from '../utils/method';
import { ThrottleKeyOption, BaseHttpService } from '../services/BaseHttpService';
import { DEFAULT_METAS } from '../reducers/MetaReducer';
import { BaseAsyncAction } from './BaseAsyncAction';

export interface Types {
  prepare: string;
  success: string;
  fail: string;
}

export interface IBaseRequestAction<Data = any, Response = any, Payload = any, Type = Types> extends IActionPayload<Payload, Type>, IMetaAction {
  method: METHOD;
  uri: string;
  body: Record<string, any>;
  query: Record<string, any>;
  successText: string;
  failText: string;
  hideError: boolean | ((response: IResponseAction<unknown, Payload>) => boolean);
  requestOptions: object;
  modelName: string;
  throttle: {
    enable: boolean;
    duration: number;
    key: string;
    transfer: ThrottleKeyOption['transfer'];
  },
  onPrepare?: (state: State<Data>, action: IActionPayload<Payload>) => StateReturn<Data>;
  afterPrepare?: (action: IActionPayload<Payload>) => void;
  afterPrepareDuration?: number;
  onSuccess?: (state: State<Data>, action: IResponseAction<Response, Payload>) => StateReturn<Data>;
  afterSuccess?: (action: IResponseAction<Response, Payload>) => void;
  afterSuccessDuration?: number;
  onFail?: (state: State<Data>, action: IResponseAction<unknown, Payload>) => StateReturn<Data>;
  afterFail?: (action: IResponseAction<unknown, Payload>) => void;
  afterFailDuration?: number;
}

export interface HttpTransform {
  httpStatus?: HTTP_STATUS_CODE;
  message?: string;
  businessCode?: string;
}

export interface IResponseAction<Response = any, Payload = any> extends IActionPayload<Payload>, HttpTransform {
  response: Response;
}

export interface RequestPrepareAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload, string> {
  loading: boolean;
  effect: IBaseRequestAction<Data, Response, Payload>['onPrepare'];
  after: IBaseRequestAction<Data, Response, Payload>['afterPrepare'];
  afterDuration: IBaseRequestAction<Data, Response, Payload>['afterPrepareDuration'];
}

export interface RequestSuccessAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload, string>, IResponseAction<Response, Payload> {
  loading: boolean;
  effect: IBaseRequestAction<Data, Response, Payload, Payload>['onSuccess'];
  after: IBaseRequestAction<Data, Response, Payload, Payload>['afterSuccess'];
  afterDuration: IBaseRequestAction<Data, Response, Payload>['afterSuccessDuration'];
}

export interface RequestFailAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload, string>, IResponseAction<unknown, Payload> {
  loading: boolean;
  effect: IBaseRequestAction<Data, Response, Payload, Payload>['onFail'];
  after: IBaseRequestAction<Data, Response, Payload, Payload>['afterFail'];
  afterDuration: IBaseRequestAction<Data, Response, Payload>['afterFailDuration'];
}

export interface RequestSubscriber {
  when: string;
  duration?: number;
}

export interface RequestPrepareSubscriber<CustomData, Payload> extends RequestSubscriber {
  then?: (state: State<CustomData>, action: IActionPayload<Payload>) => StateReturn<CustomData>;
  after?: (action: IActionPayload<Payload>) => void;
}

export interface RequestSuccessSubscriber<CustomData, Response, Payload> extends RequestSubscriber {
  then?: (state: State<CustomData>, action: IResponseAction<Response, Payload>) => StateReturn<CustomData>;
  after?: (action: IResponseAction<Response, Payload>) => void;
}

export interface RequestFailSubscriber<CustomData, Payload> extends RequestSubscriber {
  then?: (state: State<CustomData>, action: IResponseAction<unknown, Payload>) => StateReturn<CustomData>;
  after?: (action: IResponseAction<unknown, Payload>) => void;
}

export class BaseRequestAction<Data, Builder extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, any, M>, Response, Payload, M> extends BaseAsyncAction<Data> {
  protected readonly builder: Builder;
  // Avoid re-render component even if state doesn't change.
  protected loadingsCache?: [Metas, MetasLoading<any>];
  protected readonly service: BaseHttpService<any, any>;

  constructor(builder: Builder, service: BaseHttpService<any, any>, fromSubClass?: boolean) {
    super(getCurrentModel());
    this.builder = builder;
    this.service = service;

    return fromSubClass ? this : this.proxy();
  }

  /**
   * Clear throttle cache for this action
   */
  public clearThrottle(): void {
    this.service.clearThrottle(this.getName());
  }

  /**
   * Information collected from service.
   * ```javascript
   * class TestModel extends Model {
   *   getUser = $api.action((id: number) => {
   *     return this
   *      .get('/api')
   *      .metas(id)
   *      .onSuccess(() => {})
   *   });
   * }
   *
   * const testModel = new TestModel();
   *
   * // Get information
   * testModel.getUser.metas.pick(1).httpStatus;
   * // Dispatch action
   * testModel.getUser(1);
   * ```
   */
  public get metas(): Metas<M> {
    return metaReducer.getMeta(this.getName()) || DEFAULT_METAS;
  }

  /**
   * @see get metas()
   *
   * ```javascript
   * testModel.getUser.loadings.pick(1);
   * ```
   */
  public get loadings(): MetasLoading<M> {
    return this.getLoadingHandler(this.metas);
  }

  /**
   * For model.subscriptions()
   */
  public onSuccess<CustomData>(changeState: NonNullable<RequestSuccessSubscriber<CustomData, Response, Payload>['then']>): RequestSuccessSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getSuccessType(),
      then: changeState,
    };
  }

  /**
   * For model.subscriptions()
   */
  public afterSuccess<CustomData>(callback: NonNullable<RequestSuccessSubscriber<CustomData, Response, Payload>['after']>, duration?: number): RequestSuccessSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getSuccessType(),
      after: callback,
      duration: duration,
    };
  }

  /**
   * For model.subscriptions()
   */
  public onPrepare<CustomData>(changeState: NonNullable<RequestPrepareSubscriber<CustomData, Payload>['then']>): RequestPrepareSubscriber<CustomData, Payload> {
    return {
      when: this.getPrepareType(),
      then: changeState,
    };
  }

  /**
   * For model.subscriptions()
   */
  public afterPrepare<CustomData>(callback: NonNullable<RequestPrepareSubscriber<CustomData, Payload>['after']>, duration?: number): RequestPrepareSubscriber<CustomData, Payload> {
    return {
      when: this.getPrepareType(),
      after: callback,
      duration: duration,
    };
  }

  /**
   * For model.subscriptions()
   */
  public onFail<CustomData>(changeState: NonNullable<RequestFailSubscriber<CustomData, Payload>['then']>): RequestFailSubscriber<CustomData, Payload> {
    return {
      when: this.getFailType(),
      then: changeState,
    };
  }

  /**
   * For model.subscriptions()
   */
  public afterFail<CustomData>(callback: NonNullable<RequestFailSubscriber<CustomData, Payload>['after']>, duration?: number): RequestFailSubscriber<CustomData, Payload> {
    return {
      when: this.getFailType(),
      after: callback,
      duration: duration,
    };
  }

  protected getLoadingHandler(metas: Metas): MetasLoading<any> {
    if (!this.loadingsCache || this.loadingsCache[0] !== metas) {
      this.loadingsCache = [metas, {
        pick: (payload) => metas.pick(payload).loading,
      }];
    }

    return this.loadingsCache[1];
  }

  /**
   * @override
   */
  protected methods(): string[] {
    return super.methods().concat(
      'onSuccess', 'onPrepare', 'onFail',
      'afterSuccess', 'afterPrepare', 'afterFail',
      'clearThrottle',
    );
  }

  /**
   * @override
   */
  protected getters(): string[] {
    return super.getters().concat('metas', 'loadings');
  }

  /**
   * @implements
   */
  protected action(): Function {
    const self = this;

    return function () {
      return self.service.runAction(
        self.builder.apply(null, arguments as unknown as any[]).collect(self.getName(), {
          prepare: self.getPrepareType(),
          success: self.getSuccessType(),
          fail: self.getFailType(),
        }),
      );
    }
  }
}
