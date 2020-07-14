import { AnyAction, Store } from 'redux';
import { setInstanceName } from '../utils/setModelName';
import { NormalAction, IActionNormal } from '../actions/NormalAction';
import { setCurrentModel } from '../utils/setModel';
import { ComposeAction } from '../actions/ComposeAction';
import { HttpServiceBuilderWithMeta, HttpServiceBuilder } from '../services/HttpServiceBuilder';
import { METHOD } from '../utils/method';
import { IReducers, BaseReducer } from '../reducers/BaseReducer';
import { ForgetRegisterError } from '../exceptions/ForgetRegisterError';
import { NullReducerError } from '../exceptions/NullReducerError';
import { storeHelper } from '../stores/StoreHelper';

export type AnyModel = BaseModel<any>;

export type State<Data> = Data extends object ? Data & {
  /**
   * `Modify data directly like this:`
   * ```javascript
   * this.action((state, i: number) => {
   *   state.amount += i;
   *   state.foo.bar = { is: 'cool' };
   *   state.names.push('dc');
   *   // Don't return state above.
   *   // But new state must return.
   * });
   * ```
   */
  readonly __mvvm: null;
} : Data;

export type StateReturn<Data> = Data extends object ? Data : void | (Data & {
  readonly __mvvm?: 'Don\'t return state unless it\'s new';
});

export type Effects<Data> = Array<{
  when: string;
  effect: (state: State<Data>, action: AnyAction) => StateReturn<Data>;
}>;

export type CreateNormalActionPayload<A> = A extends (state: any, payload: infer P) => any ? P : never;
export type CreateNormalActionEffect<Data, A> = A extends (state: any, ...args: infer P) => any ? (...args: P) => IActionNormal<Data, P[0]> : never;

export abstract class BaseModel<Data = null, RequestOption extends object = object> {
  private readonly __name: string;
  private readonly __alias: string;
  private __anonymousAction?: (() => IActionNormal<Data>) & NormalAction<Data, (state: State<Data>) => StateReturn<Data>, any>;

  constructor(alias: string = '') {
    setCurrentModel(this);
    this.__alias = alias;
    this.__name = this.getReducerName();

    if (this.autoRegister()) {
      storeHelper.appendReducers(this.register());
    }

    storeHelper.listenOnce((item) => this.onStoreCreated(item.store));
  }

  public getReducerName(): string {
    return this.__name || setInstanceName(this.constructor.name, this.__alias);
  }

  public get data(): Data extends null ? never : Data {
    const data = storeHelper.getState()[this.__name];

    if (data === undefined) {
      const initData = this.initReducer();
      if (initData === null) {
        throw new NullReducerError(this.__name);
      } else {
        throw new ForgetRegisterError(this.__name);
      }
    }

    return data;
  }

  protected clearData(): void {
    // TODO
  }

  protected changeReducer(fn: (state: State<Data>) => StateReturn<Data>): void {
    if (this.__anonymousAction) {
      this.__anonymousAction.changeCallback(fn);
    } else {
      this.__anonymousAction = this.action(fn);
      this.__anonymousAction.setName('anonymous-action');
    }

    this.__anonymousAction();
  }

  protected action<Fn extends (state: State<Data>, payload: any) => StateReturn<Data>>(
    effect: Fn
  ): CreateNormalActionEffect<Data, Fn> & NormalAction<Data, Fn, CreateNormalActionPayload<Fn>> {
    const action = new NormalAction<Data, Fn, CreateNormalActionPayload<Fn>>(this, effect);

    return action as CreateNormalActionEffect<Data, Fn> & typeof action;
  }

  protected compose<Fn extends (...args: any[]) => Promise<any>>(fn: Fn): Fn & ComposeAction<Data, Fn> {
    const action = new ComposeAction(this, fn);

    return action as Fn & typeof action;
  }

  public/*protected*/ effects(): Effects<Data> {
    return [];
  }

  protected get<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this.__createHttpServiceBuilder<Response>(uri, METHOD.get);
  }

  protected post<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this.__createHttpServiceBuilder<Response>(uri, METHOD.post);
  }

  protected put<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this.__createHttpServiceBuilder<Response>(uri, METHOD.put);
  }

  protected delete<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this.__createHttpServiceBuilder<Response>(uri, METHOD.delete);
  }

  protected patch<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this.__createHttpServiceBuilder<Response>(uri, METHOD.patch);
  }

  protected connect<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this.__createHttpServiceBuilder<Response>(uri, METHOD.connect);
  }

  public register(): IReducers {
    const reducer = new BaseReducer(this);
    return reducer.createReducer();
  }

  protected autoRegister(): boolean {
    return true;
  }

  /**
   * Filter data from storage. Assign model to allowlist before you can use persist:
   * ```javascript
   * const store = createReduxStore({
   *   persist: {
   *     allowlist: {
   *       xxxModel,
   *       yyyModel,
   *     }
   *   }
   * });
   * ```
   *
   * MVVM is allowed here.
   */
  declare public/*protected*/ filterPersistData?: (data: State<Data>) => StateReturn<Data>;

  protected onStoreCreated(
    // @ts-ignore
    store: Store
  ): void {}

  public/*protected*/ abstract initReducer(): Data;

  private __createHttpServiceBuilder<Response>(uri: string, method: METHOD): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    const builder = new HttpServiceBuilder<Data, Response>({
      uri,
      method,
      instanceName: this.__name,
    });

    // @ts-ignore
    // @ts-expect-error
    return builder;
  }
}
