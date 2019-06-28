import { Model } from './Model';
import { METHOD } from './util';
import { useSelector } from 'react-redux';

type CreateActionOption<Payload = RM.AnyObject> = Partial<Omit<RM.RequestAction<Payload>, 'type' | 'middleware' | 'uri' | 'method'>>;

type PayloadKey<Payload> = keyof Payload;

type PayloadData = string | number | symbol;

const DEFAULT_META: RM.ReducerMeta = {
  actionType: '',
  loading: false,
};

export abstract class RequestModel<Data = {}, Response = {}, Payload extends RM.AnyObject = {}> extends Model<Data> {
  public static middlewareName = 'default-request-api-middleware-name';

  protected readonly prepareType: string;

  protected readonly failType: string;

  constructor(instanceName: string = '') {
    super(instanceName);

    this.prepareType = `${this.typePrefix} prepare`;
    this.failType = `${this.typePrefix} fail`;
    this.action = this.action.bind(this);
  }

  public getPrepareType(): string {
    return this.prepareType;
  }

  public getFailType(): string {
    return this.failType;
  }

  public createMeta(): (state: any, action: RM.ResponseAction) => RM.ReducerMeta {
    return (state, action) => {
      if (!state) {
        state = DEFAULT_META;
      }

      switch (action.type) {
        case this.prepareType:
          return {
            actionType: action.type,
            loading: true,
          };
        case this.successType:
          return {
            actionType: action.type,
            loading: false,
          };
        case this.failType:
          return {
            actionType: action.type,
            loading: false,
            errorMessage: action.errorMessage,
            httpStatus: action.httpStatus,
            businessCode: action.businessCode,
          };
        default:
          return state;
      }
    };
  }

  public createMetas(payloadKey: PayloadKey<Payload>): (state: any, action: RM.ResponseAction<{}, Payload>) => RM.ReducerMetas {
    return (state, action) => {
      if (!state) {
        state = {};
      }

      switch (action.type) {
        case this.prepareType:
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: true,
            },
          };
        case this.successType:
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: false,
            },
          };
        case this.failType:
          return {
            ...state,
            [action.payload[payloadKey]]: {
              actionType: action.type,
              loading: false,
              errorMessage: action.errorMessage,
              httpStatus: action.httpStatus,
              businessCode: action.businessCode,
            },
          };
        default:
          return state;
      }
    };
  }

  public abstract action(...args: any[]): RM.MiddlewareEffect<Response, Payload>;

  public hookRegister(useData: boolean, useMetaOrMetas: boolean | PayloadKey<Payload>): RM.HookRegister {
    const obj = {};

    if (useData) {
      obj[`data_${this.typePrefix}`] = this.createData();
    }

    if (useMetaOrMetas) {
      // Type string means use metas and provide payloadKey.
      if (typeof useMetaOrMetas === 'boolean') {
        obj[`meta_${this.typePrefix}`] = this.createMeta();
      } else {
        obj[`metas_${this.typePrefix}`] = this.createMetas(useMetaOrMetas);
      }
    }

    return obj;
  }

  public stateToData<T = Data>(state: any, filter?: (data: Data) => T): T {
    const data = state[`data_${this.typePrefix}`];

    return filter ? filter(data) : data;
  }

  public stateToMeta<T = RM.ReducerMeta>(state: any, fromMetas?: PayloadData, filter?: (meta: RM.ReducerMeta) => T): T {
    if (typeof fromMetas === 'function') {
      filter = fromMetas;
      fromMetas = undefined;
    }

    const meta: RM.ReducerMeta = fromMetas === undefined
      ? state[`meta_${this.typePrefix}`]
      : state[`metas_${this.typePrefix}`][fromMetas] || DEFAULT_META;

    // @ts-ignore
    return filter ? filter(meta) : meta;
  }

  public stateToLoading(state: any, fromMetas?: PayloadData): boolean {
    return this.stateToMeta(state, fromMetas, (meta) => meta.loading);
  }

  public useData<T = Data>(filter?: (data: Data) => T): T {
    return useSelector((state: {}) => {
      return filter
        ? filter(state[`data_${this.typePrefix}`])
        : state[`data_${this.typePrefix}`];
    });
  }

  public useMeta<T = RM.ReducerMeta>(filter?: (meta: RM.ReducerMeta) => T): T {
    return useSelector((state: {}) => {
      return filter
        ? filter(state[`meta_${this.typePrefix}`])
        : state[`meta_${this.typePrefix}`];
    });
  }

  public useMetas<T = RM.ReducerMeta>(payloadData: PayloadData, filter?: (meta: RM.ReducerMeta) => T): T {
    // @ts-ignore
    return useSelector((state: {}) => {
      const meta: RM.ReducerMeta = state[`metas_${this.typePrefix}`][payloadData] || DEFAULT_META;

      return filter ? filter(meta) : meta;
    });
  }

  public useLoading(fromMetas?: PayloadData, ...orUseLoading: boolean[]): boolean {
    if (typeof fromMetas === 'boolean') {
      orUseLoading.push(fromMetas);
      fromMetas = undefined;
    }

    if (fromMetas) {
      return this.useMetas(fromMetas, (meta) => meta.loading);
    }

    return this.useMeta((meta) => meta.loading) || orUseLoading.includes(true);
  }

  protected get(uri: string, options: CreateActionOption<Payload> = {}): RM.MiddlewareEffect<Response, Payload> {
    return this.createAction({
      uri,
      method: METHOD.get,
      ...options,
    });
  }

  protected post(uri: string, options: CreateActionOption<Payload> = {}): RM.MiddlewareEffect<Response, Payload> {
    return this.createAction({
      uri,
      method: METHOD.post,
      ...options,
    });
  }

  protected put(uri: string, options: CreateActionOption<Payload> = {}): RM.MiddlewareEffect<Response, Payload> {
    return this.createAction({
      uri,
      method: METHOD.put,
      ...options,
    });
  }

  protected patch(uri: string, options: CreateActionOption<Payload> = {}): RM.MiddlewareEffect<Response, Payload> {
    return this.createAction({
      uri,
      method: METHOD.patch,
      ...options,
    });
  }

  protected delete(uri: string, options: CreateActionOption<Payload> = {}): RM.MiddlewareEffect<Response, Payload> {
    return this.createAction({
      uri,
      method: METHOD.delete,
      ...options,
    });
  }

  protected getMiddlewareName(): string {
    return RequestModel.middlewareName;
  }

  protected abstract onSuccess(state: Data, action: RM.ResponseAction<Response, Payload>): Data;

  private createAction(
    options: CreateActionOption<Payload> & Pick<RM.RequestAction<Payload>, 'uri' | 'method'>,
  ): RM.MiddlewareEffect<Response, Payload> {
    const data: RM.RequestAction<Payload> = {
      type: {
        prepare: this.prepareType,
        success: this.successType,
        fail: this.failType,
      },
      middleware: this.getMiddlewareName(),
      // @ts-ignore
      payload: options.payload || {},
      uri: options.uri,
      method: options.method,
      body: options.body || {},
      query: options.query || {},
      successText: options.successText || '',
      hideError: options.hideError || false,
      requestOptions: options.requestOptions || {},
    };

    // @ts-ignore
    return data;
  }
}
