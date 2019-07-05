import { AxiosError, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { Dispatch, Middleware, MiddlewareAPI } from 'redux';

interface Action<T = any> {
  type: T;
}

type AnyFunctionReturnType<T> = T extends (...args: any) => infer R ? R : never;

export type EnhanceState<T> = {
  [key in keyof T]: AnyFunctionReturnType<T[key]>;
};

export declare enum METHOD {
  get = "GET",
  post = "POST",
  put = "PUT",
  delete = "DELETE",
  head = "HEAD",
  patch = "PATCH"
}

export declare enum HTTP_STATUS_CODE {
  ok = 200,
  created = 201,
  accepted = 202,
  noContent = 204,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  unProcessableEntity = 422,
  serviceError = 500,
  badGateWay = 502,
  serviceUnavailable = 503
}

declare abstract class BaseAction<Data> {
  private static COUNTER;
  protected readonly successType: string;
  protected readonly typePrefix: string;
  protected constructor(instanceName: string);
  getSuccessType(): string;
  collectEffects(): RM.ReducerEffects<Data>;
  collectReducers(): RM.HookRegister;
  private getTypePrefix;
}

interface NormalActionParam<Data, A> {
  action: A;
  onSuccess?: (state: Data, action: RM.NormalAction) => Data;
}

declare class NormalAction<Data, A extends (...args: any[]) => RM.NormalAction = any> extends BaseAction<Data> {
  readonly action: A;
  protected readonly successCallback?: (state: Data, action: any) => Data;
  constructor(config: NormalActionParam<Data, A>, instanceName: string);
  static createNormalData<Payload = {}>(payload: Payload): RM.NormalAction<Payload>;
  collectEffects(): RM.ReducerEffects<Data>;
}

type CreateActionOption = Partial<Omit<RM.RequestAction, 'type' | 'uri' | 'method'>>;
type PayloadData = string | number | symbol;

interface RequestActionParam<Data, A> {
  action: A;
  meta?: boolean | string;
  onSuccess?: (state: Data, action: any) => Data;
  onPrepare?: (state: Data, action: any) => Data;
  onFail?: (state: Data, action: any) => Data;
}

declare class RequestAction<Data = any, A extends (...args: any[]) => RM.MiddlewareEffect = any> extends NormalAction<Data> {
  readonly action: A;
  protected readonly meta: boolean | string;
  protected readonly prepareCallback?: (state: Data, action: RM.ResponseAction) => Data;
  protected readonly failCallback?: (state: Data, action: RM.ResponseAction) => Data;
  protected readonly prepareType: string;
  protected readonly failType: string;
  constructor(config: RequestActionParam<Data, A>, instanceName: string);
  collectEffects(): RM.ReducerEffects<Data>;
  collectReducers(): RM.HookRegister;
  getPrepareType(): string;
  getFailType(): string;

  useMeta<T = RM.ReducerMeta>(filter?: (meta: RM.ReducerMeta) => T): T;
  useMeta<T = RM.ReducerMeta>(payloadData?: PayloadData, filter?: (meta: RM.ReducerMeta) => T): T;

  useLoading(): boolean;
  useLoading(...orUseLoading: boolean[]): boolean;
  useLoading(payloadData: PayloadData, ...orUseLoading: boolean[]): boolean;

  connectMeta<T = RM.ReducerMeta>(rootState: any, filter?: (meta: RM.ReducerMeta) => T): T;
  connectMeta<T = RM.ReducerMeta>(rootState: any, payloadData?: PayloadData, filter?: (meta: RM.ReducerMeta) => T): T;

  connectLoading(rootState: any): boolean;
  connectLoading(rootState: any, payloadData: PayloadData): boolean;

  static createRequestData(options: CreateActionOption & Pick<RM.RequestAction, 'uri' | 'method' | 'middleware'>): RM.MiddlewareEffect;
  protected createMeta(): (state: any, action: RM.ResponseAction) => RM.ReducerMeta;
  protected createMetas(payloadKey: string): (state: any, action: RM.ResponseAction<{}>) => RM.ReducerMetas;
}

declare class BaseReducer<Data> {
  protected readonly initData: Data;
  protected cases: RM.ReducerEffects<Data>;
  protected readonly instanceName: string;
  constructor(init: Data, instanceName: string);
  clear(): void;
  addCase(...config: RM.ReducerEffects<Data>): void;
  getReducerName(): string;
  createData(): RM.HookRegister;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type createRequestDataOption = Partial<Omit<RM.RequestAction, 'type' | 'middleware' | 'uri' | 'method'>>;

declare abstract class Model<Data = null> {
  static middlewareName: string;
  private sequenceCounter;
  private readonly instanceName;
  private readonly actions;
  private readonly reducer;
  constructor(instanceName?: string);
  register(): RM.HookRegister;
  useData<T = Data>(filter?: (data: Data) => T): T;
  connectData<T = Data>(rootState: any, filter?: (data: Data) => T): T;
  protected actionNormal<A extends (...args: any[]) => RM.NormalAction = any>(config: NormalActionParam<Data, A>): NormalAction<Data, A>;
  protected actionRequest<A extends (...args: any[]) => RM.MiddlewareEffect = any>(config: RequestActionParam<Data, A>): RequestAction<Data, A>;
  protected emit(payload?: {}): RM.NormalAction<{}, string>;
  protected getEffects(): RM.ReducerEffects<Data>;
  protected get(uri: string, options?: createRequestDataOption): RM.MiddlewareEffect;
  protected post(uri: string, options?: createRequestDataOption): RM.MiddlewareEffect;
  protected put(uri: string, options?: createRequestDataOption): RM.MiddlewareEffect;
  protected patch(uri: string, options?: createRequestDataOption): RM.MiddlewareEffect;
  protected delete(uri: string, options?: createRequestDataOption): RM.MiddlewareEffect;
  protected getMiddlewareName(): string;
  protected abstract getInitValue(): Data;
}

interface FailTransform {
  httpStatus?: HTTP_STATUS_CODE;
  errorMessage?: string;
  businessCode?: string;
}

export declare const createRequestMiddleware: <State extends RM.AnyObject>(config: {
  id: string;
  baseUrl: string;
  axiosConfig?: AxiosRequestConfig | undefined;
  onInit?: ((api: MiddlewareAPI<Dispatch, State>, action: RM.RequestAction<RM.AnyObject, RM.RequestTypes>) => void) | undefined;
  getTimeoutMessage?: () => string;
  getHeaders: (api: MiddlewareAPI<Dispatch, State>) => RM.AnyObject;
  onFail: (error: RM.HttpError, transform: FailTransform) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}) => Middleware<{}, State, Dispatch>;

declare global {
  namespace RM {
    interface AnyObject {
      [key: string]: any;
    }

    type ReducerEffects<Data> = Array<{
      when: string;
      effect: (state: Data, action: any) => Data;
    }>;

    interface ReducerMeta {
      actionType: string;
      loading: boolean;
      errorMessage?: string;
      httpStatus?: number;
      businessCode?: string | number;
    }

    type ReducerMetas = Partial<{
      [key: string]: RM.ReducerMeta;
    }>;

    interface RequestTypes {
      prepare: string;
      success: string;
      fail: string;
    }

    interface HookRegister {
      [key: string]: (state: any, action: any) => any;
    }

    type HttpCanceler = Canceler;

    interface HttpError<T = any> extends AxiosError {
      response: AxiosResponse<T>;
    }

    interface MiddlewareEffect<Response = {}, Payload = {}> {
      promise: Promise<RM.ResponseAction<Response, Payload>>;
      cancel: HttpCanceler;
      type: any;
    }

    interface NormalAction<Payload = RM.AnyObject, Type = string> extends Action<Type> {
      payload: Payload;
    }

    interface RequestAction<Payload = RM.AnyObject, Type = RequestTypes> extends RM.NormalAction<Payload, Type> {
      middleware: string;
      method: METHOD;
      uri: string;
      requestOptions: AxiosRequestConfig;
      body: RM.AnyObject;
      query: RM.AnyObject;
      successText: string;
      hideError: boolean | ((response: RM.ResponseAction<any>) => boolean);
    }

    interface ResponseAction<Response = {}, Payload = RM.AnyObject> extends RM.RequestAction<Payload, string> {
      response: Response;
      errorMessage?: string;
      httpStatus?: HTTP_STATUS_CODE;
      businessCode?: string;
    }
  }
}
