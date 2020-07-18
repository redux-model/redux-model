import { BaseAction, IActionPayload, actionProxyKeys } from './BaseAction';
import { getCurrentModel } from '../utils/setModel';
import { metaReducer, Meta, Metas, MetasLoading, IMetaAction } from '../reducers/MetaReducer';
import { State, StateReturn } from '../models/BaseModel';
import { HTTP_STATUS_CODE } from '../utils/httpStatusCode';
import { HttpServiceBuilder } from '../services/HttpServiceBuilder';
import { METHOD } from '../utils/method';
import { setActionName } from '../utils/setActionName';
import { IClearThrottleAction } from '../services/BaseHttpService';
import { storeHelper } from '../stores/StoreHelper';
import { ACTION_TYPE_CLEAR_THROTTLE } from '../utils/actionType';
import { DEFAULT_META, DEFAULT_METAS } from '../reducers/MetaReducer';

export interface Types {
  prepare: string;
  success: string;
  fail: string;
}

export interface IBaseRequestAction<Data = any, Response = any, Payload = any, Type = Types> extends IActionPayload<Payload, Type>, IMetaAction {
  uniqueId: number;
  method: METHOD;
  uri: string;
  body: object;
  query: object;
  successText: string;
  failText: string;
  hideError: boolean | ((response: IResponseAction<Response, Payload>) => boolean);
  requestOptions: object;
  modelName: string;
  useThrottle: boolean;
  throttleMillSeconds: number;
  throttleKey: string;
  throttleDeps: any[];
  onPrepare: null | ((state: State<Data>, action: IActionPayload<Payload>) => StateReturn<Data>);
  afterPrepare: null | ((action: IActionPayload<Payload>) => void);
  onSuccess: null | ((state: State<Data>, action: IResponseAction<Response, Payload>) => StateReturn<Data>);
  afterSuccess: null | ((action: IResponseAction<Response, Payload>) => void);
  onFail: null | ((state: State<Data>, action: IResponseAction<unknown, Payload>) => StateReturn<Data>);
  afterFail: null | ((action: IResponseAction<unknown, Payload>) => void);
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
  effectCallback: IBaseRequestAction<Data, any, Payload>['afterPrepare'];
}

export interface InternalSuccessAction<Data = any, Response = any, Payload = any> extends IBaseRequestAction<Data, Response, Payload, string>, IResponseAction<Response, Payload> {
  loading: boolean;
  effect: IBaseRequestAction<Data, Response, Payload, string>['onSuccess'];
  effectCallback: IBaseRequestAction<Data, Response, Payload, string>['afterSuccess'];
  fromThrottle?: boolean;
}

// TODO: 区分prepare, success, fail
export interface RequestSubscriber<CustomData, Response, Payload>{
  when: string;
  effect?: (state: State<CustomData>, action: IResponseAction<Response, Payload>) => StateReturn<CustomData>;
  effectCallback?: (action: IResponseAction<Response, Payload>) => void;
}

export const requestActionProxyKeys: {
  methods: (keyof BaseRequestAction<any, any, any, any, any>)[];
  getters: (keyof BaseRequestAction<any, any, any, any, any>)[];
} = {
  methods: [
    'onSuccess', 'onPrepare', 'onFail',
    'afterSuccess', 'afterPrepare', 'afterFail',
    'getPrepareType', 'getFailType',
    'clearThrottle',
    ...actionProxyKeys.methods,
  ],
  getters: [
    'meta', 'metas',
    'loading', 'loadings',
    ...actionProxyKeys.getters,
  ],
};

export class BaseRequestAction<Data, Builder extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, any, M>, Response, Payload, M> extends BaseAction<Data> {
  protected readonly builder: Builder;
  // Avoid re-render component even if state doesn't change.
  protected loadingsCache?: [Metas, MetasLoading<any>];
  public/*protected*/ readonly uniqueId: number;
  private __prepareType?: string;
  private __failType?: string;

  constructor(builder: Builder, uniqueId: number, fromSubClass: boolean = false) {
    super(getCurrentModel());
    this.builder = builder;
    this.uniqueId = uniqueId;

    return fromSubClass ? this : this.proxy();
  }

  public clearThrottle(): void {
    storeHelper.dispatch<IClearThrottleAction>({
      type: ACTION_TYPE_CLEAR_THROTTLE,
      key: this.getSuccessType(),
      uniqueId: this.uniqueId,
    });
  }

  public get meta(): Meta {
    return metaReducer.getMeta(this.getActionName()) || DEFAULT_META;
  }

  public get loading(): boolean {
    return this.meta.loading;
  }

  public get metas(): Metas {
    return metaReducer.getMeta(this.getActionName()) || DEFAULT_METAS;
  }

  public get loadings(): MetasLoading<any> {
    return this.getLoadingHandler(this.metas);
  }

  public getPrepareType(): string {
    return this.__prepareType || setActionName(this).__prepareType!;
  }

  public getFailType(): string {
    return this.__failType || setActionName(this).__failType!;
  }

  public onSuccess<CustomData>(effect: NonNullable<RequestSubscriber<CustomData, Response, Payload>['effect']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getSuccessType(),
      effect,
    };
  }

  public afterSuccess<CustomData>(callback: NonNullable<RequestSubscriber<CustomData, Response, Payload>['effectCallback']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getSuccessType(),
      effectCallback: callback,
    };
  }

  public onPrepare<CustomData>(effect: NonNullable<RequestSubscriber<CustomData, Response, Payload>['effect']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getPrepareType(),
      effect,
    };
  }

  public afterPrepare<CustomData>(callback: NonNullable<RequestSubscriber<CustomData, Response, Payload>['effectCallback']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getPrepareType(),
      effectCallback: callback,
    };
  }

  public onFail<CustomData>(effect: NonNullable<RequestSubscriber<CustomData, Response, Payload>['effect']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getFailType(),
      effect,
    };
  }

  public afterFail<CustomData>(callback: NonNullable<RequestSubscriber<CustomData, Response, Payload>['effectCallback']>): RequestSubscriber<CustomData, Response, Payload> {
    return {
      when: this.getFailType(),
      effectCallback: callback,
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
  protected getProxyMethods(): string[] {
    return requestActionProxyKeys.methods;
  }

  /**
   * @override
   */
  protected getProxyGetters(): string[] {
    return requestActionProxyKeys.getters;
  }

  /**
   * @implements
   */
  protected getProxyFn(): Function {
    return (...args: Parameters<Builder>) => {
      return storeHelper.dispatch(
        this.builder(...args).collect(this),
      );
    };
  }

  /**
   * @override
   */
  public/*protected*/ setName(name: string | number): void {
    super.setName(name);
    this.__prepareType = this.__actionName + ' prepare';
    this.__failType = this.__actionName + ' fail';
  }
}
