import { Store } from 'redux';
import { setModel } from '../utils/model';
import { NormalAction, IActionNormal } from '../actions/NormalAction';
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

  constructor(alias?: string) {
    this._name = setModel(this, alias);

    storeHelper.appendReducers(this._register());
    storeHelper.onCreated(() => {
      this.onStoreCreated(storeHelper.store);
    });
  }

  public getReducerName(): string {
    return this._name;
  }

  /**
   * The redux data for this model. The same as `store.getState()[model.getReducerName()]`
   *
   * @throws NullReducerError
   * @throws ForgetRegisterError
   */
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

  /**
   * The same as action(), but it's a type of IIFE, we can't not use it twice.
   *
   * ```javascript
   * class TestModel extends Model {
   *   custom() {
   *     this.changeState((state) => {
   *       state.amount += 1;
   *     });
   *
   *     this.changeState((state) => {
   *       state.amount += 2;
   *     });
   *   }
   * }
   * ```
   * @see action()
   */
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

  /**
   * Common action to change state.
   *
   * ```javascript
   * class TestModel extends Model {
   *   add = this.action((state, count: number) => {
   *     state.amount += count;
   *   });
   * }
   * ```
   */
  protected action<Fn extends (state: State<Data>, payload: any) => StateReturn<Data>, After extends (action: IActionPayload<CreateNormalActionPayload<Fn>>) => void>(
    changeState: Fn,
    options?: {
      afterSuccess: After;
      duration?: number;
    }
  ): CreateNormalActionEffect<Data, Fn> & NormalAction<Data, Fn, CreateNormalActionPayload<Fn>, After> {
    const action = new NormalAction<Data, Fn, CreateNormalActionPayload<Fn>, After>(
      this,
      changeState,
      options && options.afterSuccess,
      options && options.duration,
    );

    return action as CreateNormalActionEffect<Data, Fn> & typeof action;
  }

  /**
   * The action which compose aysnchorize program and hold loading.
   * ```
   * class TestModel extends Model {
   *   updateRoom = this.compose(async (id: number) => {
   *     const roomId = await getRoomId(id);
   *     const userId = await getUserId(roomId);
   *
   *     this.changeState((state) => {
   *       state.push([userId, roomId]);
   *     });
   *   });
   * }
   *
   * const testModel = new TestModel();
   *
   * -------------
   *
   * // Hold loading
   * const loading = testModel.updateRoom.useLoading();
   * // Dispatch action
   * const promise = testModel.updateRoom(10);
   * ```
   */
  protected compose<Fn extends (...args: any[]) => Promise<any>>(fn: Fn): Fn & ComposeAction<Data, Fn> {
    const action = new ComposeAction(this, fn);

    return action as Fn & typeof action;
  }

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

  /**
   * The listeners subscribe events from other models.
   * ```javascript
   * import { Effects } from '@redux-model/*';
   *
   * class TestModel extends Model<Data> {
   *
   *   protected effects(): Effects<Data> {
   *     return [
   *       aModel.xxAction.onSuccess((state, action) => {
   *          // Chagnge state here.
   *          // The 'state' belongs to TestModel, and 'action' belongs to aModel.
   *
   *          // state.name = action.response.name;
   *          // state.name = action.payload.name;
   *       }),
   *
   *       aModel.xxAction.afterSuccess((action) => {
   *          // Dispatch more action here.
   *       }),
   *
   *        ...
   *     ];
   *   }
   * }
   * ```
   */
  protected effects(): Effects<Data> {
    return [];
  }

  /**
   * Request get method
   */
  protected get<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.get);
  }

  /**
   * Request post method
   */
  protected post<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.post);
  }

  /**
   * Request put method
   */
  protected put<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.put);
  }

  /**
   * Request delete method
   */
  protected delete<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.delete);
  }

  /**
   * Request patch method
   */
  protected patch<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.patch);
  }

  /**
   * Request connect method
   */
  protected connect<Response>(uri: string): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    return this._createBuilder<Response>(uri, METHOD.connect);
  }

  /**
   * The callback on store is created and persist rehydrate is complete.
   */
  protected onStoreCreated(
    // @ts-ignore
    store: Store
  ): void {}

  /**
   * The initial state for reducer.
   * When you enable persist to effect this model, the persist data will override it.
   */
  protected abstract initialState(): Data;

  private _register(): IReducers {
    return new BaseReducer(
      this.getReducerName(),
      this.initialState(),
      this.effects(),
      this.filterPersistData()
    ).createReducer();
  }

  private _createBuilder<Response>(uri: string, method: METHOD): HttpServiceBuilderWithMeta<Data, Response, unknown, RequestOption> {
    const builder = new HttpServiceBuilder<Data, Response>({
      uri,
      method,
      instanceName: this._name,
    });

    // @ts-ignore
    return builder;
  }
}
