import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { METHOD } from './utils/method';
import { BaseRequestAction } from './action/BaseRequestAction';
import { RequestAction } from '../libs/RequestAction';
import { BaseReducer } from './reducer/BaseReducer';
import { NormalAction } from './action/NormalAction';
import { BaseAction } from './action/BaseAction';
import { isDebug, isProxyEnable } from './utils/dev';
import {
  ActionNormal,
  Effects,
  NormalActionParam,
  Reducers,
  RequestActionParamNoMeta,
  RequestActionParamWithMeta,
  RequestActionParamWithMetas,
  RequestActionWithMeta,
  RequestActionWithMetas,
  RequestOptions,
  UseSelector
} from './utils/types';
import { FetchHandle } from '../libs/types';

type EnhanceResponse<A> = A extends (...args: any[]) => FetchHandle<infer R, any> ? R : never;
type EnhancePayload<A> = A extends (...args: any[]) => FetchHandle<any, infer P> ? P : never;
type EnhanceNormalPayload<A> = A extends (...args: any[]) => ActionNormal<infer P> ? P : never;

export abstract class BaseModel<Data = null> {
  private static CLASS_COUNTER = 0;

  public static middlewareName: string = 'default-request-middleware-name';

  private actionCounter = 0;

  private readonly instanceName: string;

  private readonly actions: Array<BaseAction<Data>> = [];

  private readonly reducer: null | BaseReducer<Data> = null;

  constructor(instanceName: string = '') {
    this.instanceName = (instanceName ? `[${instanceName}]` : '') + this.constructor.name;
    BaseModel.CLASS_COUNTER += 1;

    if (!isDebug()) {
      this.instanceName += `.${BaseModel.CLASS_COUNTER}`;
    }

    const initData = this.initReducer();

    if (initData !== null) {
      this.reducer = new BaseReducer<Data>(initData, this.instanceName, 'data');
    }

    if (isDebug() && isProxyEnable()) {
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

  // As we know, it's forbidden to make condition when we are using hooks.
  // We can't write code like: xxxModel.xxx.useLoading() || xxxModel.yyy.useLoading()
  // So, just write code like: Model.isLoading(xxxModel.xxx.useLoading(), xxxModel.yyy.useLoading());
  public static isLoading(...fromUseLoading: boolean[]): boolean {
    return fromUseLoading.some((is) => is);
  }

  public register(): Reducers {
    let reducers: Reducers = {};

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
      this.reducer.addCase(...this.effects());
      reducers = {
        ...reducers,
        ...this.reducer.createData(this.mvvmForReducer()),
      };
    }

    return reducers;
  }

  public useData<T = Data>(filter?: (data: Data) => T): T {
    if (this.reducer) {
      return this.switchReduxSelector()((state) => {
        const customData = state[this.reducer!.getReducerName()];

        return filter ? filter(customData) : customData;
      });
    }

    throw new ReferenceError(`[${this.constructor.name}] It seems like you hadn't initialize your reducer yet.`);
  }

  public connectData(): Data {
    if (this.reducer) {
      return this.reducer.getCurrentReducerData();
    }

    throw new ReferenceError(`[${this.constructor.name}] It seems like you hadn't initialize your reducer yet.`);
  }

  // FIXME: To compatible with typescript 3.3, we should remove generics ActionNormal<Payload>, and add `ActionNormal` instead.
  // It's very strange, because this feature is supported by all ts versions above 3.0 except 3.3
  protected actionNormal<A extends (...args: any[]) => ActionNormal<Payload>, Payload = EnhanceNormalPayload<A>>(
    config: NormalActionParam<Data, A, Payload>
  ): NormalAction<Data, A, Payload> {
    let instanceName = this.instanceName;
    if (!isDebug() || !isProxyEnable()) {
      this.actionCounter += 1;
      instanceName += '.' + this.actionCounter;
    }

    const instance = new NormalAction<Data, A, Payload>(config, instanceName);
    this.actions.push(instance);

    return instance;
  }

  // When meta=false
  protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamNoMeta<Data, A, Response, Payload>
  ): RequestAction<Data, A, Response, Payload>;

  // When meta is undefined or true.
  // @ts-ignore
  protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamWithMeta<Data, A, Response, Payload>
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  // When meta is the key of payload.
  protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamWithMetas<Data, A, Response, Payload>
  ): RequestActionWithMetas<Data, A, Response, Payload>;

  protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamNoMeta<Data, A, Response, Payload>
  ): RequestAction<Data, A, Response, Payload> {
    let instanceName = this.instanceName;
    if (!isDebug() || !isProxyEnable()) {
      this.actionCounter += 1;
      instanceName += '.' + this.actionCounter;
    }

    const instance = new RequestAction<Data, A, Response, Payload>(config, instanceName);
    this.actions.push(instance);

    return instance;
  }

  protected actionThunk<A extends (...args: any[]) => ThunkAction<any, any, any, Action>>(
    action: A
  ): (...args: Parameters<A>) => ReturnType<ReturnType<A>> {
    // @ts-ignore
    return action;
  }

  protected emit<Payload = undefined>(payload?: Payload): ActionNormal<Payload> {
    return NormalAction.createNormalData<Payload>(payload);
  }

  protected get<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.get,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected post<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.post,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected put<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.put,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected delete<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.delete,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected effects(): Effects<Data> {
    return [];
  }

  protected getMiddlewareName(): string {
    return BaseModel.middlewareName;
  }

  // Open immer feature and you can modify state directly.
  protected mvvmForReducer(): boolean {
    return true;
  }

  protected abstract initReducer(): Data;

  protected abstract switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
