import { Store } from 'redux';
import { NormalAction } from './action/NormalAction';
import { BaseReducer } from './reducer/BaseReducer';
import {
  ActionNormalHandle,
  Effects,
  ExtractNormalAction,
  ExtractNormalPayload,
  HttpServiceWithMeta,
  NormalActionAlias,
  Reducers,
  State,
  StateReturn,
  UseSelector,
} from './utils/types';
import { appendReducers, onStoreCreated, watchEffectsReducer } from './utils/createReduxStore';
import { useProxy } from './utils/dev';
import { ForgetRegisterError } from './exceptions/ForgetRegisterError';
import { NullReducerError } from './exceptions/NullReducerError';
import { BaseAction } from './action/BaseAction';
import { HttpServiceBuilder } from './service/HttpServiceBuilder';
import { getInstanceName, increaseActionCounter, setInstanceName } from './utils/instanceName';
import { METHOD } from './utils/method';

export abstract class BaseModel<Data = null> {
  private readonly __instanceName: string;

  private __reducer?: BaseReducer<Data>;
  private __reducerHasEffects: boolean = false;

  // Property name will be displayed into action.type, we just make it readable by developer.
  // Therefore, we use snake case to define name.
  private __change_reducer?: NormalActionAlias<Data, () => ActionNormalHandle<Data, any>, any>;

  constructor(alias: string = '') {
    this.__instanceName = setInstanceName(this.constructor.name, alias);
    this.onInit();
    onStoreCreated(this.onReducerCreated.bind(this));

    if (this.autoRegister()) {
      appendReducers(this.register());
      if (this.__reducer && this.__reducerHasEffects) {
        watchEffectsReducer(this.__instanceName, this.constructor.name);
      }
    }

    if (useProxy()) {
      // es6 syntax without polyfill, be careful to use Proxy
      // We are not consider using Proxy in prod mode
      return new Proxy(this, {
        set: (model, property: string, value) => {
          model[property] = value;
          if (typeof value === 'function' && value.__isAction__ === true) {
            (value as BaseAction).setActionName(property);
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
    // Only create class once.
    // For effects model, register() will be invoked twice.
    if (!this.__reducer) {
      const initData = this.initReducer();

      if (initData !== null) {
        this.__reducer = new BaseReducer<Data>(initData, this.__instanceName);
      }
    }

    if (this.__reducer) {
      const sideEffects = this.effects();

      this.__reducer.clear();
      this.__reducer.addCase(...sideEffects);
      this.__reducerHasEffects = sideEffects.length > 0;

      return this.__reducer.createData();
    }

    return {};
  }

  public useData<T = Data>(filter?: (data: Data) => T): T {
    if (this.__reducer) {
      return this.switchReduxSelector()((state) => {
        const customData = state[this.__instanceName];

        if (customData === undefined) {
          throw new ForgetRegisterError(this.constructor.name);
        }

        return filter ? filter(customData) : customData;
      });
    }

    throw new NullReducerError(this.constructor.name);
  }

  public get data(): Data {
    if (this.__reducer) {
      const customData = this.__reducer.getData();

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

  protected changeReducer(fn: (state: State<Data>) => StateReturn<Data>): void {
    if (this.__reducer) {
      if (this.__change_reducer) {
        this.__change_reducer.changeEffect(fn);
      } else {
        this.__change_reducer = this.action(fn);
      }

      this.__change_reducer();
    } else {
      throw new NullReducerError(this.__instanceName);
    }
  }

  protected action<A extends (state: State<Data>, payload: any) => StateReturn<Data>>(
    changeReducer: A
  ): NormalActionAlias<Data, ExtractNormalAction<A>, ExtractNormalPayload<A>> {
    let instanceName = getInstanceName();

    if (!useProxy()) {
      instanceName += '_' + increaseActionCounter();
    }

    type Payload = ExtractNormalPayload<A>;

    return  new NormalAction<Data, ExtractNormalAction<A>, Payload>(
      // @ts-ignore
      (payload) => {
        const normal: ActionNormalHandle<Data, Payload> = {
          type: '',
          payload: payload === undefined ? {} : payload,
          reducerName: this.__instanceName,
          effect: (state, action) => {
            return changeReducer(state, action.payload);
          },
        };

        return normal;
      },
      instanceName,
    );
  }

  protected serviceAction<Response>(uri: string, method: METHOD): HttpServiceWithMeta<Data, Response, unknown> {
    // @ts-ignore
    return new HttpServiceBuilder({
      uri,
      method,
      instanceName: this.__instanceName,
    });
  }

  protected get<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown> {
    return this.serviceAction<Response>(uri, METHOD.get);
  }

  protected post<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown> {
    return this.serviceAction<Response>(uri, METHOD.post);
  }

  protected put<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown> {
    return this.serviceAction<Response>(uri, METHOD.put);
  }

  protected delete<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown> {
    return this.serviceAction<Response>(uri, METHOD.delete);
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
