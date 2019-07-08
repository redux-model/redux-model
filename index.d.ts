import { AxiosError, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { Dispatch, Middleware, MiddlewareAPI, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

/**
 * Useful for combineReducer, If you are using IDE WebStorm, you'd better write code like this:
 *
 * const reducers = { ... };
 *
 * export const rootReducer = Reducer<EnhanceState<typeof reducers>> = combineReducer<reducers>;
 *
 * declare global {
 *   type RootState = Readonly<ReturnType<typeof rootReducers>>;
 * }
 *
 */
export type EnhanceState<T> = {
  [key in keyof T]: T[key] extends (...args: any) => infer R ? R : never;
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
  getSuccessType(): string;
}

interface NormalActionParam<Data, Payload, A extends (...args: any[]) => RM.NormalAction<Payload>> {
  action: A;
  onSuccess?: (state: Data, action: RM.NormalAction<Payload>) => Data;
}

type NormalSubscriber<CustomData, Payload> = {
  when: string;
  effect: (state: CustomData, action: RM.NormalAction<Payload>) => CustomData;
};

declare class NormalAction<Data = any, Payload = any, A extends (...args: any[]) => RM.NormalAction<Payload> = any> extends BaseAction<Data> {
  readonly action: A;
  onSuccess<CustomData>(effect: (state: CustomData, action: RM.NormalAction<Payload>) => CustomData): NormalSubscriber<CustomData, Payload>;
}

type PayloadData = string | number | symbol;

interface RequestActionParam<Data, Response, Payload, A extends (...args: any[]) => RM.FetchHandle<Response, Payload>> {
  action: A;
  meta?: boolean | string;
  onSuccess?: (state: Data, action: RM.ResponseAction<Response, Payload>) => Data;
  onPrepare?: (state: Data, action: RM.ResponseAction<Response, Payload>) => Data;
  onFail?: (state: Data, action: RM.ResponseAction<Response, Payload>) => Data;
}

type RequestSubscriber<CustomData, Response, Payload> = {
  when: string;
  effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData;
};

// @ts-ignore
declare class RequestAction<Data = any, Response = {}, Payload = {}, A extends (...args: any[]) => RM.FetchHandle<Response, Payload> = any> extends NormalAction<Data, Payload, A> {
  readonly action: A;

  // @ts-ignore
  onSuccess<CustomData>(effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;
  onPrepare<CustomData>(effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;
  onFail<CustomData>(effect: (state: CustomData, action: RM.ResponseAction<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;

  getPrepareType(): string;
  getFailType(): string;

  useMeta<T = RM.Meta>(filter?: (meta: RM.Meta) => T): T;
  useMetas(): RM.Metas;
  useMetas<T = RM.Meta>(payloadData: PayloadData, filter?: (meta: RM.Meta) => T): T;
  useLoading(...orUseLoading: boolean[]): boolean;
  useLoading(payloadData: PayloadData, ...orUseLoading: boolean[]): boolean;

  connectMeta(rootState: any): RM.Meta;
  connectMetas(rootState: any): RM.Metas;
  connectMetas(rootState: any, payloadData: PayloadData): RM.Meta;
  connectLoading(rootState: any, payloadData?: PayloadData): boolean;
}

type RequestOptions<Payload> = (Partial<Omit<RM.RequestAction, 'uri' | 'payload' | 'type' | 'method'>> & {
  uri: string;
} & (Payload extends {} ? {
  payload: Payload;
} : {
  payload?: never;
}));

declare type EnhanceResponse<A> = A extends (...args: any[]) => RM.FetchHandle<infer R, any> ? R : never;
declare type EnhancePayload<A> = A extends (...args: any[]) => RM.FetchHandle<any, infer P> ? P : never;
declare type EnhanceNormalPayload<A> = A extends (...args: any[]) => RM.NormalAction<infer P> ? P : never;

declare abstract class Model<Data = null> {
  static middlewareName: string;
  constructor(instanceName?: string);
  register(): RM.Reducers;
  useData<T = Data>(filter?: (data: Data) => T): T;
  connectData(rootState: any): Data;
  protected actionNormal<A extends (...args: any[]) => RM.NormalAction<Payload>, Payload = EnhanceNormalPayload<A>>(config: NormalActionParam<Data, Payload, A>): NormalAction<Data, Payload, A>;
  protected actionRequest<A extends (...args: any[]) => RM.FetchHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(config: RequestActionParam<Data, Response, Payload, A>): RequestAction<Data, Response, Payload, A>;
  protected actionThunk<A extends (...args: any[]) => ThunkAction<any, any, any, Action>>(action: A): (...args: Parameters<A>) => ReturnType<ReturnType<A>>;

  // Used for actionNormal
  protected emit<Payload = unknown>(payload?: Payload): RM.NormalAction<Payload>;

  // Used for actionRequest
  protected get<Response, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected post<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected put<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected patch<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;
  protected delete<Response = {}, Payload = unknown>(options: RequestOptions<Payload>): RM.FetchHandle<Response, Payload>;

  protected subscribers(): RM.Subscriber<Data>;
  protected getMiddlewareName(): string;
  protected abstract initReducer(): Data;
}

export declare const createRequestMiddleware: <RootState = any>(config: {
  id: string;
  baseUrl: string;
  axiosConfig?: AxiosRequestConfig | undefined;
  onInit?: ((api: MiddlewareAPI<Dispatch, RootState>, action: RM.RequestAction) => void) | undefined;
  getTimeoutMessage?: () => string;
  getHeaders: (api: MiddlewareAPI<Dispatch, RootState>) => object;
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
}) => Middleware<{}, RootState, Dispatch>;

declare global {
  namespace RM {
    type Subscriber<Data> = Array<{
      when: string;
      effect: (state: Data, action: any) => Data;
    }>;

    type Meta = Readonly<{
      actionType: string;
      loading: boolean;
      errorMessage?: string;
      httpStatus?: number;
      businessCode?: string | number;
    }>;

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

    interface FetchHandle<Response = any, Payload = any> {
      promise: Promise<RM.ResponseAction<Response, Payload>>;
      cancel: HttpCanceler;
      type: any;
    }

    interface NormalAction<Payload = any, Type = string> extends Action<Type> {
      payload: Payload;
    }

    interface RequestAction<Payload = any, Type = { prepare: string; success: string; fail: string }> extends RM.NormalAction<Payload, Type> {
      middleware: string;
      method: METHOD;
      uri: string;
      requestOptions: AxiosRequestConfig;
      body: object;
      query: object;
      successText: string;
      hideError: boolean | ((response: RM.ResponseAction<any>) => boolean);
    }

    interface ResponseAction<Response = any, Payload = any> extends RM.RequestAction<Payload, string> {
      response: Response;
      errorMessage?: string;
      httpStatus?: HTTP_STATUS_CODE;
      businessCode?: string;
    }
  }
}
