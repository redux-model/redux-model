import { IActionPayload } from './BaseAction';
import { getCurrentModel } from '../utils/setModel';
import { metaReducer, Metas, MetasLoading, IMetaAction } from '../reducers/MetaReducer';
import { State, StateReturn } from '../models/BaseModel';
import { HTTP_STATUS_CODE } from '../utils/httpStatusCode';
import { HttpServiceBuilder } from '../services/HttpServiceBuilder';
import { METHOD } from '../utils/method';
import { IClearThrottleAction, ThrottleKeyOption } from '../services/BaseHttpService';
import { storeHelper } from '../stores/StoreHelper';
import ACTION_TYPES from '../utils/actionType';
import { DEFAULT_METAS } from '../reducers/MetaReducer';
import { BaseAsyncAction } from './BaseAsyncAction';

export interface Types {
  prepare: string;
  success: string;
  fail: string;
}

export interface IBaseRequestAction<Data = any, Response = any, Payload = any, Type = Types> extends IActionPayload<Payload, Type>, IMetaAction {
  uniqueId: number;
  method: METHOD;
  uri: string;
  body: Record<string, any>;
  query: Record<string, any>;
  successText: string;
  failText: string;
  hideError: boolean | ((response: IResponseAction<Response, Payload>) => boolean);
  requestOptions: object;
  modelName: string;
  useThrottle: boolean;
  throttleMillSeconds: number;
  throttleKey: string;
  throttleTransfer: ThrottleKeyOption['transfer'];
  onPrepare: null | ((state: State<Data>, action: IActionPayload<Payload>) => StateReturn<Data>);
  afterPrepare: null | ((action: IActionPayload<Payload>) => void);
  afterPrepareDuration?: number;
  onSuccess: null | ((state: State<Data>, action: IResponseAction<Response, Payload>) => StateReturn<Data>);
  afterSuccess: null | ((action: IResponseAction<Response, Payload>) => void);
  afterSuccessDuration?: number;
  onFail: null | ((state: State<Data>, action: IResponseAction<unknown, Payload>) => StateReturn<Data>);
  afterFail: null | ((action: IResponseAction<unknown, Payload>) => void);
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

export interface InternalPrepareAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload, string> {
  loading: boolean;
  effect: IBaseRequestAction<Data, any, Payload>['onPrepare'];
  after: IBaseRequestAction<Data, any, Payload>['afterPrepare'];
  afterDuration: IBaseRequestAction<Data, any, Payload>['afterPrepareDuration'];
}

export interface InternalSuccessAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload, string>, IResponseAction<Response, Payload> {
  loading: boolean;
  effect: IBaseRequestAction<Data, Response, Payload, string>['onSuccess'];
  after: IBaseRequestAction<Data, Response, Payload, string>['afterSuccess'];
  afterDuration: IBaseRequestAction<Data, any, Payload>['afterSuccessDuration'];
}

// TODO: 区分prepare, success, fail
export interface RequestSubscriber<CustomData, Response, Payload> {
  when: string;
  then?: (state: State<CustomData>, action: IResponseAction<Response, Payload>) => StateReturn<CustomData>;
  after?: (action: IResponseAction<Response, Payload>) => void;
  duration?: number;
}

export class BaseRequestAction<Data, Builder extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, any, M>, Response, Payload, M> extends BaseAsyncAction<Data> {
  protected readonly builder: Builder;
  // Avoid re-render component even if state doesn't change.
  protected loadingsCache?: [Metas, MetasLoading<any>];
  public/*protected*/ readonly uniqueId: number;

  constructor(builder: Builder, uniqueId: number, fromSubClass: boolean = false) {
    super(getCurrentModel());
    this.builder = builder;
    this.uniqueId = uniqueId;

    return fromSubClass ? this : this.proxy();
  }

  public clearThrottle(): void {
    storeHelper.dispatch<IClearThrottleAction>({
      type: ACTION_TYPES.clearThrottle,
      key: this.getSuccessType(),
      uniqueId: this.uniqueId,
    });
  }

  public get metas(): Metas {
    return metaReducer.getMeta(this.getName()) || DEFAULT_METAS;
  }

  public get loadings(): MetasLoading<any> {
    return this.getLoadingHandler(this.metas);
  }

  public onSuccess<CustomData>(changeReducer: NonNullable<RequestSubscriber<CustomData, Response, Payload>['then']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getSuccessType(),
      then: changeReducer,
    };
  }

  public afterSuccess<CustomData>(callback: NonNullable<RequestSubscriber<CustomData, Response, Payload>['after']>, duration?: number): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getSuccessType(),
      after: callback,
      duration: duration,
    };
  }

  public onPrepare<CustomData>(changeReducer: NonNullable<RequestSubscriber<CustomData, Response, Payload>['then']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getPrepareType(),
      then: changeReducer,
    };
  }

  public afterPrepare<CustomData>(callback: NonNullable<RequestSubscriber<CustomData, Response, Payload>['after']>, duration?: number): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getPrepareType(),
      after: callback,
      duration: duration,
    };
  }

  public onFail<CustomData>(changeReducer: NonNullable<RequestSubscriber<CustomData, Response, Payload>['then']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getFailType(),
      then: changeReducer,
    };
  }

  public afterFail<CustomData>(callback: NonNullable<RequestSubscriber<CustomData, Response, Payload>['after']>, duration?: number): RequestSubscriber<CustomData, Response, Payload> {
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
    return (...args: Parameters<Builder>) => {
      return storeHelper.dispatch(
        this.builder(...args).collect(this),
      );
    };
  }
}
