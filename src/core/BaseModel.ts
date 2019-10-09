import { Store } from 'redux';
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
  UseSelector,
} from './utils/types';
import { appendReducers, onStoreCreated, watchEffectsReducer } from './utils/createReduxStore';
import { Uri } from './utils/Uri';
import { isProxyEnable } from './utils/dev';
import { RequestAction } from '../libs/RequestAction';
import { isDebug } from '../libs/dev';
import { ForgetRegisterError } from './exceptions/ForgetRegisterError';
import { NullReducerError } from './exceptions/NullReducerError';
import { BaseAction } from './action/BaseAction';
import { HttpServiceHandle } from './service/HttpServiceHandle';

export abstract class BaseModel<Data = null> {
  // In case the same classname by uglify in production mode.
  // Do not use this variable in dev mode with hot reloading.
  // Remember: Do not create class by the same name, or reducer will be override by another one.
  private static PROD_CLASS_DICT = {};

  private actionCounter = 0;

  private readonly instanceName: string;

  private readonly actions: Array<BaseAction<Data>> = [];

  private reducer?: BaseReducer<Data>;
  private reducerHasEffects: boolean = false;

  private reducerName: string = '';

  constructor(alias: string = '') {
    this.instanceName = this.constructor.name + (alias ? `.${alias}` : '');

    if (!isDebug()) {
      const dictKey = `dict_${this.instanceName}`;

      if (BaseModel.PROD_CLASS_DICT[dictKey] === undefined) {
        BaseModel.PROD_CLASS_DICT[dictKey] = 0;
      } else {
        BaseModel.PROD_CLASS_DICT[dictKey] += 1;
      }

      if (BaseModel.PROD_CLASS_DICT[dictKey] > 0) {
        this.instanceName += `-${BaseModel.PROD_CLASS_DICT[dictKey]}`;
      }
    }

    this.onInit();
    onStoreCreated((store) => {
      this.onReducerCreated(store);
    });

    if (this.autoRegister()) {
      appendReducers(this.register());
      if (this.reducer && this.reducerHasEffects) {
        watchEffectsReducer(this.reducer.getReducerName(), this.constructor.name);
      }
    }

    if (isDebug() && isProxyEnable()) {
      // Proxy is es6 syntax, and it can't be transformed to es5.
      return new Proxy(this, {
        set: (model, property: string, value) => {
          model[property] = value;
          if (typeof value === 'function' && value.__isAction__ === true) {
            const instance = value as BaseAction<Data>;
            instance.setActionName(property);

            if (this.reducer) {
              // Method register() was invoked, we should append case immediately.
              this.reducer.addCase(...instance.collectEffects());
            }
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

    // Only create class once.
    // For effects model, register() will be invoked twice.
    if (!this.reducer && initData !== null) {
      this.reducer = new BaseReducer<Data>(initData, this.instanceName);
      this.reducerName = this.reducer.getReducerName();
    }

    if (this.reducer) {
      const sideEffects = this.effects();

      this.reducer.clear();
      this.reducer.addCase(...sideEffects);
      this.reducerHasEffects = sideEffects.length > 0;

      for (const action of this.actions) {
        this.reducer.addCase(...action.collectEffects());
      }

      return this.reducer.createData();
    }

    return {};
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
      instanceName += '_' + this.actionCounter;
    }

    const instance = new NormalAction<Data, ExtractNormalAction<A>, ExtractNormalPayload<A>>({
      // @ts-ignore
      // FIXME: Incompatible with ExtractNormalAction<A>
      action: (payload) => {
        return {
          type: '',
          payload: payload === undefined ? {} : payload,
        };
      },
      onSuccess: (state, action) => {
        return changeReducer(state, action.payload);
      },
    }, instanceName);

    this.actions.push(instance);
    if (this.autoRegister()) {
      if (this.reducer && (!isDebug() || !isProxyEnable())) {
        this.reducer.addCase(...instance.collectEffects());
      }
    }

    return instance;
  }

  // When meta=false
  protected actionRequest<A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamNoMeta<Data, A, Response, Payload>
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  // When meta is undefined or true.
  // @ts-ignore
  protected actionRequest<A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamWithMeta<Data, A, Response, Payload>
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  // When meta is the key of payload.
  protected actionRequest<A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamWithMetas<Data, A, Response, Payload>
  ): RequestActionWithMetas<Data, A, Response, Payload>;

  protected actionRequest<A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    config: RequestActionParamNoMeta<Data, A, Response, Payload>
  ): RequestAction<Data, A, Response, Payload> {
    let instanceName = this.instanceName;
    if (!isDebug() || !isProxyEnable()) {
      this.actionCounter += 1;
      instanceName += '_' + this.actionCounter;
    }

    const instance = new RequestAction<Data, A, Response, Payload>(config, instanceName);

    this.actions.push(instance);
    if (this.autoRegister()) {
      // Method register() was invoked, we should append case immediately.
      if (this.reducer && (!isDebug() || !isProxyEnable())) {
        this.reducer.addCase(...instance.collectEffects());
      }
    }

    return instance;
  }

  protected uri<Response>(uri: string): Uri<Response> {
    return new Uri<Response>(uri);
  }

  protected effects(): Effects<Data> {
    return [];
  }

  protected autoRegister(): boolean {
    return true;
  }

  protected abstract initReducer(): Data;

  protected abstract switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
