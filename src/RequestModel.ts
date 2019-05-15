import { Dispatch } from 'redux';
import { Model } from './Model';
import { METHOD } from './util';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type CreateActionOption<Payload = RM.AnyObject> = Partial<Omit<RM.RequestAction<Payload>, 'type' | 'middleware' | 'uri' | 'method'>>;

// AsyncAction + Reducer
export abstract class RequestModel<Data = {}, Response = {}, Payload extends RM.AnyObject = {}> extends Model<Data> {
  protected readonly prepareType: string;

  protected readonly failType: string;

  constructor(name: string = '') {
    super(name);
    const prefix = this.getTypePrefix();

    this.prepareType = `${prefix} ${name} prepare`;
    this.failType = `${prefix} ${name} fail`;
    this.action = this.action.bind(this);
  }

  public getPrepareType(): string {
    return this.prepareType;
  }

  public getFailType(): string {
    return this.failType;
  }

  public createMeta(): (state: RM.ReducerMeta | undefined, action: RM.ResponseAction) => RM.ReducerMeta {
    return (state, action) => {
      if (!state) {
        state = {
          actionType: '',
          loading: false,
        };
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

  public createMetas(payloadKey: string): (state: RM.ReducerMetas | undefined, action: RM.ResponseAction<{}, Payload>) => RM.ReducerMetas {
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

  public dispatch(
    dispatch: Dispatch,
    action: RM.MiddlewareEffect<Response, Payload>,
  ): RM.MiddlewareEffect<Response, Payload> {
    // @ts-ignore
    return dispatch(action);
  }

  public abstract action(...args: any[]): RM.MiddlewareEffect<Response, Payload>;

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

  protected abstract onSuccess(state: Data, action: RM.ResponseAction<Response, Payload>): Data;

  protected abstract getMiddlewareName(): string;

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
