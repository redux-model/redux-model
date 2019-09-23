import { Store } from 'redux';
import { BaseAction } from './action/BaseAction';
import { BaseRequestAction } from './action/BaseRequestAction';
import { NormalAction } from './action/NormalAction';
import { BaseReducer } from './reducer/BaseReducer';
import {
  Effects,
  State,
  StateReturn,
  EnhancePayload,
  EnhanceResponse,
  ExtractNormalAction,
  ExtractNormalPayload,
  Reducers,
  RequestActionNoMeta,
  RequestActionParamNoMeta,
  RequestActionParamWithMeta,
  RequestActionParamWithMetas,
  RequestActionWithMeta,
  RequestActionWithMetas,
  RequestOptions,
  UseSelector,
} from './utils/types';
import { METHOD } from './utils/method';
import { onStoreCreated } from './utils/createReduxStore';
import { Uri } from './utils/Uri';
import { isProxyEnable } from './utils/dev';
import { RequestAction } from '../libs/RequestAction';
import { isDebug } from '../libs/dev';
import { FetchHandle } from '../libs/types';
import { ForgetRegisterError } from './exceptions/ForgetRegisterError';
import { NullReducerError } from './exceptions/NullReducerError';

export abstract class BaseModel<Data = null> {
  public static middlewareName: string = 'default-request-middleware-name';

  // In case the same classname by uglify in production mode.
  // In case user create the same classname in different folders.
  private static CLASS_DICT = {};

  private actionCounter = 0;

  private readonly instanceName: string;

  private readonly actions: Array<BaseAction<Data>> = [];

  private reducer: null | BaseReducer<Data> = null;

  private reducerName: string = '';

  constructor(alias: string = '') {
    this.instanceName = this.constructor.name + (alias ? `.${alias}` : '');
    const dictKey = `dict_${this.instanceName}`;

    if (BaseModel.CLASS_DICT[dictKey] === undefined) {
      BaseModel.CLASS_DICT[dictKey] = 0;
    } else {
      BaseModel.CLASS_DICT[dictKey] += 1;
    }

    if (BaseModel.CLASS_DICT[dictKey] > 0) {
      this.instanceName += `.${BaseModel.CLASS_DICT[dictKey]}`;
    }

    this.onInit();
    onStoreCreated((store) => {
      this.onReducerCreated(store);
    });

    if (isDebug() && isProxyEnable()) {
      // Proxy is es6 syntax, and it can't be transformed to es5.
      return new Proxy(this, {
        set: (model, property: string, value) => {
          model[property] = value;
          if (typeof value === 'function' && value.__isAction__ === true) {
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
    const initData = this.initReducer();
    let reducers: Reducers = {};

    if (initData !== null) {
      this.reducer = new BaseReducer<Data>(initData, this.instanceName);
      this.reducerName = this.reducer.getReducerName();
    }

    if (this.reducer) {
      this.reducer.clear();
    }

    for (const action of this.actions) {
      reducers = {
        ...reducers,
        ...action.collectReducers(),
      };

      if (this.reducer) {
        this.reducer.addCase(...action.collectEffects());
      }
    }

    if (this.reducer) {
      this.reducer.addCase(...this.effects());
      reducers = {
        ...reducers,
        ...this.reducer.createData(),
      };
    }

    return reducers;
  }

  public useData<T = Data>(filter?: (data: Data) => T): T {
    if (this.reducer) {
      return this.switchReduxSelector()((state) => {
        const customData = state[this.reducerName];

        if (customData === undefined) {
          throw new ForgetRegisterError(this.constructor.name);
        }

        return filter ? filter(customData) : customData;
      });
    }

    throw new NullReducerError(this.constructor.name);
  }

  public get data(): Data {
    if (this.reducer) {
      const customData = this.reducer.getCurrentReducerData();

      if (customData === undefined) {
        throw new ForgetRegisterError(this.constructor.name);
      }

      return customData;
    }

    throw new NullReducerError(this.constructor.name);
  }

  protected onInit(): void {
    // Do anything as in constructor.
  }

  protected onReducerCreated(_store: Store): void {
    // Do anything after reducer is generated.
  }

  protected actionNormal<A extends (state: State<Data>, payload: any) => StateReturn<Data>>(
    changeReducer: A
  ): NormalAction<Data, ExtractNormalAction<A>, ExtractNormalPayload<A>> {
    let instanceName = this.instanceName;
    if (!isDebug() || !isProxyEnable()) {
      this.actionCounter += 1;
      instanceName += '.' + this.actionCounter;
    }

    const instance = new NormalAction<Data, ExtractNormalAction<A>, ExtractNormalPayload<A>>({
      // @ts-ignore
      // FIXME: Incompatible with ExtractNormalAction<A>
      action: (payload) => {
        return NormalAction.createNormalData(payload);
      },
      onSuccess: (state, action) => {
        return changeReducer(state, action.payload);
      },
    }, instanceName);
    this.actions.push(instance);

    return instance;
  }

  // When meta=false
  protected actionRequest<A extends (...args: any[]) => FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamNoMeta<Data, A, Response, Payload>
  ): RequestActionNoMeta<Data, A, Response, Payload>;

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

  protected uri<Response>(uri: string): Uri<Response> {
    return new Uri<Response>(uri);
  }

  protected get<Response = any, Payload = undefined>(options: RequestOptions<Response, Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.get,
      middleware: this.getMiddlewareName(),
      ...options,
      uri: options.uri.getUri(),
    });
  }

  protected post<Response = any, Payload = undefined>(options: RequestOptions<Response, Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.post,
      middleware: this.getMiddlewareName(),
      ...options,
      uri: options.uri.getUri(),
    });
  }

  protected put<Response = any, Payload = undefined>(options: RequestOptions<Response, Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.put,
      middleware: this.getMiddlewareName(),
      ...options,
      uri: options.uri.getUri(),
    });
  }

  protected delete<Response = any, Payload = undefined>(options: RequestOptions<Response, Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.delete,
      middleware: this.getMiddlewareName(),
      ...options,
      uri: options.uri.getUri(),
    });
  }

  protected effects(): Effects<Data> {
    return [];
  }

  protected getMiddlewareName(): string {
    return BaseModel.middlewareName;
  }

  protected abstract initReducer(): Data;

  protected abstract switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
