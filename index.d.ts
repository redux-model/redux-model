import { AxiosError, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { Dispatch, Middleware, MiddlewareAPI, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

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
  getSuccessType(): string;
}

interface NormalActionParam<Data, Payload, A extends (...args: any[]) => RM.NormalAction<Payload>> {
  action: A;
  onSuccess: (state: Data, action: RM.NormalAction<A extends (...args: any[]) => RM.NormalAction<infer R> ? R : never>) => Data;
}

declare class NormalAction<Data, Payload, A extends (...args: any[]) => RM.NormalAction<Payload>> extends BaseAction<Data> {
  readonly action: A;
}

type PayloadData = string | number | symbol;

type EnhanceResponse<A, Payload> = A extends (...args: any[]) => RM.FetchHandle<infer R, Payload> ? R : never;
type EnhancePayload<A, Response> = A extends (...args: any[]) => RM.FetchHandle<Response, infer R> ? R : never;

interface RequestActionParam<Data, Response, Payload, A extends (...args: any[]) => RM.FetchHandle<Response, Payload>> {
  action: A;
  meta?: boolean | string;
  onSuccess?: (state: Data, action: RM.ResponseAction<EnhanceResponse<A, Payload>, EnhancePayload<A, Response>>) => Data;
  onPrepare?: (state: Data, action: RM.ResponseAction<EnhanceResponse<A, Payload>, EnhancePayload<A, Response>>) => Data;
  onFail?: (state: Data, action: RM.ResponseAction<EnhanceResponse<A, Payload>, EnhancePayload<A, Response>>) => Data;
}

// @ts-ignore
declare class RequestAction<Data = any, Response = {}, Payload = {}, A extends (...args: any[]) => RM.FetchHandle<Response, Payload> = any> extends NormalAction<Data, Payload, A> {
  readonly action: A;
  getPrepareType(): string;
  getFailType(): string;

  useMeta<T = RM.Meta>(filter?: (meta: RM.Meta) => T): T;
  useMeta<T = RM.Meta>(payloadData?: PayloadData, filter?: (meta: RM.Meta) => T): T;

  useLoading(): boolean;
  useLoading(...orUseLoading: boolean[]): boolean;
  useLoading(payloadData: PayloadData, ...orUseLoading: boolean[]): boolean;

  connectMeta<T = RM.Meta>(rootState: any, filter?: (meta: RM.Meta) => T): T;
  connectMeta<T = RM.Meta>(rootState: any, payloadData?: PayloadData, filter?: (meta: RM.Meta) => T): T;

  connectLoading(rootState: any): boolean;
  connectLoading(rootState: any, payloadData: PayloadData): boolean;
}

type RequestOptions<Payload> = (Partial<Omit<RM.RequestAction, 'uri' | 'payload' | 'type' | 'method'>> & {
  uri: string;
} & (Payload extends {} ? {
  payload: Payload;
} : {
  payload?: never;
}));

declare abstract class Model<Data = null> {
  static middlewareName: string;
  constructor(instanceName?: string);
  register(): RM.Reducers;
  useData<T = Data>(filter?: (data: Data) => T): T;
  connectData<T = Data>(rootState: any, filter?: (data: Data) => T): T;
  protected actionNormal<Payload, A extends (this: NormalAction<Data, Payload, any>, ...args: any[]) => RM.NormalAction<Payload>>(config: NormalActionParam<Data, Payload, A>): NormalAction<Data, Payload, A>;
  protected actionRequest<Response, Payload, A extends (...args: any[]) => RM.FetchHandle<Response, Payload>>(config: RequestActionParam<Data, Response, Payload, A>): RequestAction<Data, Response, Payload, A>;
  protected actionThunk<A extends (...args: any[]) => ThunkAction<any, any, any, Action>>(action: A): (...args: Parameters<A>) => ReturnType<ReturnType<A>>;
  protected emit<Payload = unknown>(payload?: Payload): RM.NormalAction<Payload>;
  protected getEffects(): RM.Effects<Data>;
  protected get<Response, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected post<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected put<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected patch<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected delete<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected getMiddlewareName(): string;
  protected abstract initReducer(): Data;
}

export declare const createRequestMiddleware: <State = any>(config: {
  id: string;
  baseUrl: string;
  axiosConfig?: AxiosRequestConfig | undefined;
  onInit?: ((api: MiddlewareAPI<Dispatch, State>, action: RM.RequestAction) => void) | undefined;
  getTimeoutMessage?: () => string;
  getHeaders: (api: MiddlewareAPI<Dispatch, State>) => object;
  onFail: (
    error: RM.HttpError,
    transform: {
      httpStatus?: HTTP_STATUS_CODE;
      errorMessage?: string;
      businessCode?: string;
    },
  ) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}) => Middleware<{}, State, Dispatch>;

declare global {
  namespace RM {
    type Effects<Data> = Array<{
      when: string;
      effect: (state: Data, action: any) => Data;
    }>;

    interface Meta {
      actionType: string;
      loading: boolean;
      errorMessage?: string;
      httpStatus?: number;
      businessCode?: string | number;
    }

    type Metas = Partial<{
      [key: string]: RM.Meta;
    }>;

    interface Reducers {
      [key: string]: (state: any, action: any) => any;
    }

    type HttpCanceler = Canceler;

    interface HttpError<T = any> extends AxiosError {
      response: AxiosResponse<T>;
    }

    interface FetchHandle<Response = {}, Payload = {}> {
      promise: Promise<RM.ResponseAction<Response, Payload>>;
      cancel: HttpCanceler;
      type: any;
    }

    interface NormalAction<Payload = {}, Type = string> extends Action<Type> {
      payload: Payload;
    }

    interface RequestAction<Payload = {}, Type = { prepare: string; success: string; fail: string }> extends RM.NormalAction<Payload, Type> {
      middleware: string;
      method: METHOD;
      uri: string;
      requestOptions: AxiosRequestConfig;
      body: object;
      query: object;
      successText: string;
      hideError: boolean | ((response: RM.ResponseAction<any>) => boolean);
    }

    interface ResponseAction<Response = {}, Payload = {}> extends RM.RequestAction<Payload, string> {
      response: Response;
      errorMessage?: string;
      httpStatus?: HTTP_STATUS_CODE;
      businessCode?: string;
    }
  }
}
