import { Store } from 'redux';
import { NormalAction } from './action/NormalAction';
import { BaseReducer } from './reducer/BaseReducer';
import {
  Effects,
  State,
  StateReturn,
  ExtractNormalAction,
  ExtractNormalPayload,
  Reducers,
  UseSelector,
  ActionNormal,
  NormalActionAlias, HttpServiceWithMeta,
} from './utils/types';
import { appendReducers, onStoreCreated, watchEffectsReducer } from './utils/createReduxStore';
import { isProxyEnable } from './utils/dev';
import { isDebug } from '../libs/dev';
import { ForgetRegisterError } from './exceptions/ForgetRegisterError';
import { NullReducerError } from './exceptions/NullReducerError';
import { BaseAction } from './action/BaseAction';
import { HttpServiceHandle } from './service/HttpServiceHandle';
import { getInstanceName, increaseActionCounter, setInstanceName } from './utils/instanceName';

export abstract class BaseModel<Data = null> {
  private readonly instanceName: string;

  private readonly actions: Array<BaseAction<Data>> = [];

  private reducer?: BaseReducer<Data>;
  private reducerHasEffects: boolean = false;

  private reducerName: string = '';

  // Property name will be displayed into action.type, we just make it readable by developer.
  // Therefore, we use snake case to define name.
  private change_reducer?: NormalActionAlias<Data, () => ActionNormal, any>;

  constructor(alias: string = '') {
    this.instanceName = setInstanceName(this.constructor.name, alias);

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
    // Only create class once.
    // For effects model, register() will be invoked twice.
    if (!this.reducer) {
      const initData = this.initReducer();

      if (initData !== null) {
        this.reducer = new BaseReducer<Data>(initData, this.instanceName);
        this.reducerName = this.reducer.getReducerName();
      }
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

  protected changeReducer(fn: (state: State<Data>) => StateReturn<Data>): void {
    if (this.reducer) {
      if (this.change_reducer) {
        this.reducer.changeCase(this.change_reducer.getSuccessType(), fn);
      } else {
        this.change_reducer = this.action(fn);
      }

      this.change_reducer();
    } else {
      throw new NullReducerError(this.instanceName);
    }
  }

  protected action<A extends (state: State<Data>, payload: any) => StateReturn<Data>>(
    changeReducer: A
  ): NormalActionAlias<Data, ExtractNormalAction<A>, ExtractNormalPayload<A>> {
    let instanceName = getInstanceName();
    if (!isDebug() || !isProxyEnable()) {
      instanceName += '_' + increaseActionCounter();
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

    // Method register() was invoked, we should append case immediately.
    if (this.reducer && (!isDebug() || !isProxyEnable())) {
      this.reducer.addCase(...instance.collectEffects());
    }

    return instance;
  }

  protected uri<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown> {
    // @ts-ignore
    return new HttpServiceHandle({
      uri,
      instanceName: this.instanceName,
    });
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
