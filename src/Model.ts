import { Action } from 'redux';
import { useSelector } from 'react-redux';
import { ThunkAction } from 'redux-thunk';
import { METHOD } from './utils/method';
import { RequestAction, RequestActionParam } from './action/RequestAction';
import { BaseReducer } from './reducer/BaseReducer';
import { NormalAction, NormalActionParam } from './action/NormalAction';
import { BaseAction } from './action/BaseAction';

type RequestOptions<Payload> = (
  Partial<Omit<RM.RequestAction, 'uri' | 'payload' | 'type' | 'method'>>
  & { uri: string; }
  & (Payload extends {} ? { payload: Payload } : { payload?: never })
);

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
      this.reducer.addCase(...this.getEffects());

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

  public connectData<T = Data>(rootState: any, filter?: (data: Data) => T): T {
    if (this.reducer) {
      const data = rootState[this.reducer.getReducerName()];

      return filter ? filter(data) : data;
    }

    throw new ReferenceError(`[${this.constructor.name}] It seems like you hadn't initialize your reducer yet.`);
  }

  protected actionNormal<Payload, A extends (this: NormalAction<Data, Payload, any>, ...args: any[]) => RM.NormalAction<Payload>>(config: NormalActionParam<Data, Payload, A>) {
    let instanceName = this.instanceName;
    this.sequenceCounter += 1;
    instanceName += '.' + this.sequenceCounter;

    const instance = new NormalAction<Data, Payload, A>(config, instanceName);
    this.actions.push(instance);

    return instance;
  }

  protected actionRequest<Response, Payload, A extends (...args: any[]) => RM.FetchHandle<Response, Payload>>(config: RequestActionParam<Data, Response, Payload, A>) {
    let instanceName = this.instanceName;
    this.sequenceCounter += 1;
    instanceName += '.' + this.sequenceCounter;

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

  protected getEffects(): RM.Effects<Data> {
    return [];
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

  protected getMiddlewareName(): string {
    return Model.middlewareName;
  }

  protected abstract initReducer(): Data;
}
