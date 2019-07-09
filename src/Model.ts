import { Action } from 'redux';
import { useSelector } from 'react-redux';
import { ThunkAction } from 'redux-thunk';
import { METHOD } from './utils/method';
import { RequestAction, RequestActionParam } from './action/RequestAction';
import { BaseReducer } from './reducer/BaseReducer';
import { NormalAction, NormalActionParam } from './action/NormalAction';
import { BaseAction } from './action/BaseAction';
import { isDebug, isProxyEnable } from './utils/dev';

type RequestOptions<Payload> = (
  Partial<Omit<RM.RequestAction, 'uri' | 'payload' | 'type' | 'method'>>
  & { uri: string; }
  & (Payload extends {} ? { payload: Payload } : { payload?: never })
);

type EnhanceResponse<A> = A extends (...args: any[]) => RM.FetchHandle<infer R, any> ? R : never;
type EnhancePayload<A> = A extends (...args: any[]) => RM.FetchHandle<any, infer P> ? P : never;
type EnhanceNormalPayload<A> = A extends (...args: any[]) => RM.NormalAction<infer P> ? P : never;

export abstract class Model<Data = null> {
  public static middlewareName: string = 'default-request-middleware-name';

  private sequenceCounter = 0;

  private readonly instanceName: string;

  private readonly actions: Array<BaseAction<Data>> = [];

  private readonly reducer: null | BaseReducer<Data> = null;

  constructor(instanceName: string = '') {
    this.instanceName = (instanceName ? `[${instanceName}]` : '') + this.constructor.name;
    const initData = this.initReducer();

    if (initData !== null) {
      this.reducer = new BaseReducer<Data>(initData, this.instanceName);
    }

    // Do not use isDebugAndProxyEnable() for here.
    // We Just want to strip these code by uglifyJs in production mode.
    if (typeof module === 'object' && module.hot && typeof Proxy === 'function') {
      // Proxy is es6 based syntax, and it can't be transform to es5.
      return new Proxy(this, {
        set: (model, property: string, value) => {
          model[property] = value;
          if (value instanceof BaseAction) {
            value.setActionName(property);
          }

          return true;
        },
      });
    }
  }

  public register(): RM.Reducers {
    let reducers: RM.Reducers = {};

    if (this.reducer) {
      this.reducer.clear();
    }

    this.actions.forEach((action) => {
      reducers = {
        ...reducers,
        ...action.collectReducers(),
      };

      if (this.reducer) {
        this.reducer.addCase(...action.collectEffects());
      }
    });

    if (this.reducer) {
      this.reducer.addCase(...this.subscribers());
      reducers = {
        ...reducers,
        ...this.reducer.createData(),
      };
    }

    return reducers;
  }

  public useData<T = Data>(filter?: (data: Data) => T): T {
    if (this.reducer) {
      return useSelector((state: {}) => {
        const customData = state[this.reducer!.getReducerName()];

        return filter ? filter(customData) : customData;
      });
    }

    throw new ReferenceError(`[${this.constructor.name}] It seems like you hadn't initialize your reducer yet.`);
  }

  public connectData(rootState: any): Data {
    if (this.reducer) {
      return rootState[this.reducer.getReducerName()];
    }

    throw new ReferenceError(`[${this.constructor.name}] It seems like you hadn't initialize your reducer yet.`);
  }

  protected actionNormal<A extends (...args: any[]) => RM.NormalAction<Payload>, Payload = EnhanceNormalPayload<A>>(
    config: NormalActionParam<Data, Payload, A>
  ): NormalAction<Data, Payload, A> {
    let instanceName = this.instanceName;
    if (!isDebug() || !isProxyEnable()) {
      this.sequenceCounter += 1;
      instanceName += '.' + this.sequenceCounter;
    }

    const instance = new NormalAction<Data, Payload, A>(config, instanceName);
    this.actions.push(instance);

    return instance;
  }

  protected actionRequest<A extends (...args: any[]) => RM.FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParam<Data, Response, Payload, A>
  ): RequestAction<Data, Response, Payload, A> {
    let instanceName = this.instanceName;
    if (!isDebug() || !isProxyEnable()) {
      this.sequenceCounter += 1;
      instanceName += '.' + this.sequenceCounter;
    }

    const instance = new RequestAction<Data, Response, Payload, A>(config, instanceName);
    this.actions.push(instance);

    return instance;
  }

  protected actionThunk<A extends (...args: any[]) => ThunkAction<any, any, any, Action>>(
    action: A
  ): (...args: Parameters<A>) => ReturnType<ReturnType<A>> {
    // @ts-ignore
    return action;
  }

  protected emit<Payload = unknown>(payload?: Payload): RM.NormalAction<Payload> {
    return NormalAction.createNormalData<Payload>(payload);
  }

  protected get<Response, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload> {
    // @ts-ignore
    return RequestAction.createRequestData({
      method: METHOD.get,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected post<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload> {
    // @ts-ignore
    return RequestAction.createRequestData({
      method: METHOD.post,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected put<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload> {
    // @ts-ignore
    return RequestAction.createRequestData({
      method: METHOD.put,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected patch<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload> {
    // @ts-ignore
    return RequestAction.createRequestData({
      method: METHOD.patch,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected delete<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload> {
    // @ts-ignore
    return RequestAction.createRequestData({
      method: METHOD.delete,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected subscribers(): RM.Subscriber<Data> {
    return [];
  }

  protected getMiddlewareName(): string {
    return Model.middlewareName;
  }

  protected abstract initReducer(): Data;
}
