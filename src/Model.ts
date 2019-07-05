import { METHOD } from './utils/method';
import { RequestAction, RequestActionParam } from './action/RequestAction';
import { BaseReducer } from './reducer/BaseReducer';
import { NormalAction, NormalActionParam } from './action/NormalAction';
import { useSelector } from 'react-redux';
import { BaseAction } from './action/BaseAction';

type createRequestDataOption = Partial<Omit<RM.RequestAction, 'type' | 'middleware' | 'uri' | 'method'>>;

export abstract class Model<Data = null> {
  public static middlewareName: string = 'default-request-middleware-name';

  private sequenceCounter = 0;

  private readonly instanceName: string;

  private readonly actions: Array<BaseAction<Data>> = [];

  private readonly reducer: null | BaseReducer<Data> = null;

  constructor(instanceName: string = '') {
    this.instanceName = (instanceName ? `[${instanceName}]` : '') + this.constructor.name;

    const initData = this.getInitValue();

    if (initData !== null) {
      this.reducer = new BaseReducer<Data>(initData, this.instanceName);
    }
  }

  public register(): RM.HookRegister {
    let reducers: RM.HookRegister = {};

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

    throw new ReferenceError(`[${this.constructor.name}] It seems like you hadn\'t initialize your reducer yet.`);
  }

  public connectData<T = Data>(rootState: any, filter?: (data: Data) => T): T {
    if (this.reducer) {
      const data = rootState[this.reducer.getReducerName()];

      return filter ? filter(data) : data;
    }

    throw new ReferenceError(`[${this.constructor.name}] It seems like you hadn\'t initialize your reducer yet.`);
  }

  protected actionNormal<A extends (...args: any[]) => RM.NormalAction = any>(config: NormalActionParam<Data, A>) {
    let instanceName = this.instanceName;

    this.sequenceCounter += 1;
    instanceName += '.' + this.sequenceCounter;

    const instance = new NormalAction<Data, A>(config, instanceName);

    this.actions.push(instance);

    return instance;
  }

  protected actionRequest<A extends (...args: any[]) => RM.MiddlewareEffect = any>(config: RequestActionParam<Data, A>) {
    let instanceName = this.instanceName;

    this.sequenceCounter += 1;
    instanceName += '.' + this.sequenceCounter;

    const instance = new RequestAction<Data, A>(config, instanceName);

    this.actions.push(instance);

    return instance;
  }

  protected emit(payload: {} = {}) {
    return NormalAction.createNormalData(payload);
  }

  protected getEffects(): RM.ReducerEffects<Data> {
    return [];
  }

  protected get(uri: string, options: createRequestDataOption = {}): RM.MiddlewareEffect {
    return RequestAction.createRequestData({
      uri,
      method: METHOD.get,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected post(uri: string, options: createRequestDataOption = {}): RM.MiddlewareEffect {
    return RequestAction.createRequestData({
      uri,
      method: METHOD.post,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected put(uri: string, options: createRequestDataOption = {}): RM.MiddlewareEffect {
    return RequestAction.createRequestData({
      uri,
      method: METHOD.put,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected patch(uri: string, options: createRequestDataOption = {}): RM.MiddlewareEffect {
    return RequestAction.createRequestData({
      uri,
      method: METHOD.patch,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected delete(uri: string, options: createRequestDataOption = {}): RM.MiddlewareEffect {
    return RequestAction.createRequestData({
      uri,
      method: METHOD.delete,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected getMiddlewareName(): string {
    return Model.middlewareName;
  }

  protected abstract getInitValue(): Data;
}
