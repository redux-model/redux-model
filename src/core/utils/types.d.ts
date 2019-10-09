import { Action } from 'redux';
import { METHOD } from './method';
import { HTTP_STATUS_CODE } from './httpStatusCode';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { RequestAction } from '../../libs/RequestAction';
import { NormalAction } from '../action/NormalAction';
import { Uri } from './Uri';
import { HttpServiceHandle } from '../service/HttpServiceHandle';

// Omit is a new feature since typescript 3.5+
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export type UseSelector<TState, TSelected> = (
  selector: (state: TState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => TSelected;

type State<Data> = Data & {
  readonly __use_mvvm__: 'Modify data directly';
};

type StateReturn<Data> = void | (Data & {
  readonly __use_mvvm__?: 'Return new data or don\'t return';
});

export type Effects<Data> = Array<{
  when: string;
  effect: (state: State<Data>, action: any) => StateReturn<Data>;
}>;

export type Meta = Readonly<{
  actionType: string;
  loading: boolean;
  errorMessage?: string;
  httpStatus?: number;
  businessCode?: string | number;
}>;

export type Metas = Partial<{
  [key: string]: Meta;
}>;

export interface Reducers {
  [key: string]: (state: any, action: any) => any;
}

export interface ActionNormal<Payload = any, Type = string> extends Action<Type> {
  payload: Payload;
}

export interface Types {
  prepare: string;
  success: string;
  fail: string;
}

export interface BaseActionRequest<Payload = any, Type = Types> extends ActionNormal<Payload, Type> {
  method: METHOD;
  uri: string;
  body: object;
  query: object;
  successText: string;
  failText: string;
  hideError: boolean | ((response: ActionResponse) => boolean);
  requestOptions: object;
}

export interface ActionResponse<Response = any, Payload = any> extends ActionRequest<Payload, string> {
  response: Response;
  errorMessage?: string;
  httpStatus?: HTTP_STATUS_CODE;
  businessCode?: string;
}

export type RequestOptions<Response, Payload> = Partial<Omit<ActionRequest<Payload>, 'uri' | 'type' | 'method'>> & { uri: Uri<Response>; };

export type PayloadKey<A> =  A extends (...args: any[]) => HttpServiceHandle<any, infer P> ? keyof P : never;
export type PayloadData<Payload, M> = M extends keyof Payload ? Payload[M] : never;
export type IsPayload<Payload> = keyof Payload | boolean;

export type RequestSubscriber<CustomData, Response, Payload> = {
  when: string;
  effect: (state: State<CustomData>, action: ActionResponse<Response, Payload>) => StateReturn<CustomData>;
};

export interface RequestActionParamBase<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload> {
  action: A;
  onSuccess?: (state: State<Data>, action: ActionResponse<Response, Payload>) => StateReturn<Data>;
  onPrepare?: (state: State<Data>, action: ActionResponse<Response, Payload>) => StateReturn<Data>;
  onFail?: (state: State<Data>, action: ActionResponse<Response, Payload>) => StateReturn<Data>;
}

export interface RequestActionParamNoMeta<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload> extends RequestActionParamBase<Data, A, Response, Payload> {
  meta: false;
}

export interface RequestActionParamWithMeta<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload> extends RequestActionParamBase<Data, A, Response, Payload> {
  meta?: true;
}

export interface RequestActionParamWithMetas<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload, M extends IsPayload<Payload>> extends RequestActionParamBase<Data, A, Response, Payload> {
  meta: M;
}

export interface RequestActionNoMeta<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload, M extends IsPayload<Payload> = false> extends RequestAction<Data, A, Response, Payload, M> {
  (...args: Parameters<A>): FetchHandle<Response, Payload>;
}

export interface RequestActionWithMeta<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload> extends RequestActionNoMeta<Data, A, Response, Payload, true> {
  useMeta<T = Meta>(filter?: (meta: Meta) => T): T;
  useLoading(): boolean;
  connectMeta(): Meta;
  connectLoading(): boolean;
}

export interface RequestActionWithMetas<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload, M extends IsPayload<Payload>> extends RequestActionNoMeta<Data, A, Response, Payload, M> {
  useMetas(): Metas;
  useMetas<T = Meta>(payload: PayloadData<Payload, M>, filter?: (meta: Meta) => T): T;
  useLoading(payload: PayloadData<Payload, M>): boolean;
  connectMetas(): Metas;
  connectMetas(payload: PayloadData<Payload, M>): Meta;
  connectLoading(payload: PayloadData<Payload, M>): boolean;
}

export interface NormalActionParam<Data, A extends (...args: any[]) => ActionNormal<Payload>, Payload> {
  action: A;
  onSuccess?: (state: State<Data>, action: ActionNormal<Payload>) => StateReturn<Data>;
}

export interface NormalActionAlias<Data, A extends (...args: any[]) => ActionNormal<Payload>, Payload> extends NormalAction<Data, A, Payload> {
  (...args: Parameters<A>): ReturnType<A>;
}

export type NormalSubscriber<CustomData, Payload> = {
  when: string;
  effect: (state: State<CustomData>, action: ActionNormal<Payload>) => StateReturn<CustomData>;
};

export type EnhanceResponse<A> =A extends (...args: any[]) => HttpServiceHandle<infer R, any> ? R : never;
export type EnhancePayload<A> = A extends (...args: any[]) => HttpServiceHandle<any, infer P> ? P : never;

export type ExtractNormalPayload<A> = A extends (state: any, payload: infer P) => any ? P : never;
export type ExtractNormalAction<A> = A extends (state: any, ...args: infer P) => any ? (...args: P) => ActionNormal<P[0]> : never;

export interface HttpTransform {
  httpStatus?: HTTP_STATUS_CODE;
  errorMessage?: string;
  businessCode?: string;
}
