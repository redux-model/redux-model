import { Store } from 'redux';
import { setModelName } from '../utils/setModelName';
import { NormalAction, IActionNormal } from '../actions/NormalAction';
import { setCurrentModel } from '../utils/setModel';
import { ComposeAction } from '../actions/ComposeAction';
import { HttpServiceBuilderWithMeta, HttpServiceBuilder } from '../services/HttpServiceBuilder';
import { METHOD } from '../utils/method';
import { IReducers, BaseReducer } from '../reducers/BaseReducer';
import { ForgetRegisterError } from '../exceptions/ForgetRegisterError';
import { NullReducerError } from '../exceptions/NullReducerError';
import { storeHelper } from '../stores/StoreHelper';
import { IActionPayload } from '../actions/BaseAction';

export type FilterPersist<Data> = ((state: State<Data>) => StateReturn<Data>) | null;

export type AnyModel = BaseModel<any>;

export type State<Data> = Data & {
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
  readonly __mvvm: 'Modify data directly';
};

export type StateReturn<Data> = void | (Data & {
  readonly __mvvm?: 'Don\'t return state unless it\'s new';
});

export type Effects<Data> = Array<{
  when: string;
  then?: (state: State<Data>, action: any) => StateReturn<Data>;
  after?: (action: any) => void;
  duration?: number;
}>;

export type CreateNormalActionPayload<A> = A extends (state: any, payload: infer P) => any ? P : never;
export type CreateNormalActionEffect<Data, A> = A extends (state: any, ...args: infer P) => any ? (...args: P) => IActionNormal<Data, P[0]> : never;

export abstract class BaseModel<Data = null, RequestOption extends object = object> {
  private readonly _name: string;
  private _action?: (() => IActionNormal<Data>) & NormalAction<Data, (state: State<Data>) => StateReturn<Data>, any, any>;

  /**
   * Filter data from storage. Assign model to allowlist before you can use persist:
   *
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
   * Then override this method:
   *
   * protected filterPersistData(): FilterPersist<Data> {
   *   return (state) => {
   *     // ...
   *     // logic by mvvm
   *   };
   * }
   *
   */
  protected filterPersistData(): FilterPersist<Data> {
    return null;
  }

  constructor(alias: string = '') {
    setCurrentModel(this);
    this._name = setModelName(this.constructor.name, alias);

    if (this.autoRegister()) {
      storeHelper.appendReducers(this.register());
    }

    storeHelper.listenOnce((item) => this.onStoreCreated(item.store));
  }

  public getReducerName(): string {
    return this._name;
  }

  public get data(): Data extends null ? never : Data {
    const data = storeHelper.getState()[this._name];

    if (data === undefined) {
      if (this.initialState() === null) {
        throw new NullReducerError(this._name);
      } else {
        throw new ForgetRegisterError(this._name);
      }
    }

    return data;
  }

  protected changeState(fn: (state: State<Data>) => StateReturn<Data>): IActionNormal<Data, null> {
    // Make sure reducer is registered and initData not null.
    this.data;

    if (this._action) {
      this._action.setEffect(fn);
    } else {
      this._action = this.action(fn);
      this._action.setName('anonymous');
    }

    return this._action();
  }

  protected action<Fn extends (state: State<Data>, payload: any) => StateReturn<Data>, After extends (action: IActionPayload<CreateNormalActionPayload<Fn>>) => void>(
    changeState: Fn,
    options?: {
      afterSuccess: After;
      duration?: number;
    }
  ): CreateNormalActionEffect<Data, Fn> & NormalAction<Data, Fn, CreateNormalActionPayload<Fn>, After> {
    const action = new NormalAction<Data, Fn, CreateNormalActionPayload<Fn>, After>(this, changeState, options?.afterSuccess, options?.duration);

    return action as CreateNormalActionEffect<Data, Fn> & typeof action;
  }

  protected compose<Fn extends (...args: any[]) => Promise<any>>(fn: Fn): Fn & ComposeAction<Data, Fn> {
    const action = new ComposeAction(this, fn);

    return action as Fn & typeof action;
  }

  protected effects(): Effects<Data> {
    return [];
  }

  protected get<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.get);
  }

  protected post<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.post);
  }

  protected put<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.put);
  }

  protected delete<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.delete);
  }

  protected patch<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.patch);
  }

  protected connect<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.connect);
  }

  public register(): IReducers {
    const reducer = new BaseReducer(this.getReducerName(), this.initialState(), this.effects(), this.filterPersistData());
    return reducer.createReducer();
  }

  protected autoRegister(): boolean {
    return true;
  }

  protected onStoreCreated(
    // @ts-ignore
    store: Store
  ): void {}

  protected abstract initialState(): Data;

  private _createBuilder<Response>(uri: string, method: METHOD): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    const builder = new HttpServiceBuilder<Data, Response>({
      uri,
      method,
      instanceName: this._name,
    });

    // @ts-ignore
    // @ts-expect-error
    return builder;
  }
}
