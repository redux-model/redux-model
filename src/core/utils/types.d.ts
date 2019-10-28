import { Action } from 'redux';
import { METHOD } from './method';
import { HTTP_STATUS_CODE } from './httpStatusCode';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { RequestAction } from '../../libs/RequestAction';
import { NormalAction } from '../action/NormalAction';
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
} & HttpTransform>;

export type Metas<M = any> = Partial<{
  [key: string]: Meta;
}> & {
  pick: (value: M) => Meta;
};

export type MetasLoading<M> = {
  pick: (value: M) => boolean;
};

export interface Reducers {
  [key: string]: (state: any, action: any) => any;
}

export interface ActionNormal<Payload = any, Type = string> extends Action<Type> {
  payload: Payload;
}

export interface ActionNormalHandle<Data = any, Payload = any> extends ActionNormal<Payload, string> {
  reducerName: string;
  effect: (state: State<Data>, action: ActionNormal<Payload, string>) => StateReturn<Data>;
}

export interface Types {
  prepare: string;
  success: string;
  fail: string;
}

export interface BaseActionRequest<Data = any, Response = any, Payload = any, Type = Types> extends ActionNormal<Payload, Type> {
  method: METHOD;
  uri: string;
  body: object;
  query: object;
  successText: string;
  failText: string;
  hideError: boolean | ((response: ReducerAction<Response, Payload>) => boolean);
  requestOptions: object;
  metaKey: string | number | symbol | boolean;
  reducerName: string;
  useCache: boolean;
  cacheMillSeconds: number;
  onSuccess: null | ((state: State<Data>, action: ReducerAction<Response, Payload>) => StateReturn<Data>);
  onPrepare: null | ((state: State<Data>, action: ReducerAction<Response, Payload>) => StateReturn<Data>);
  onFail: null | ((state: State<Data>, action: ReducerAction<Response, Payload>) => StateReturn<Data>);
}

export interface ActionResponseHandle<Data = any, Response = any, Payload = any> extends ActionRequest<Data, Response, Payload, string>, ReducerAction<Response, Payload> {
  effect: null | ((state: State<Data>, action: ActionResponseHandle<Data, Response, Payload>) => StateReturn<Data>);
}

export interface ReducerAction<Response = any, Payload = any> extends ActionNormal<Payload>, HttpTransform {
  response: Response;
}

export type RequestOptions<Data, Response, Payload> = Partial<Omit<ActionRequest<Data, Response, Payload>, 'type'>> & { uri: string; instanceName: string; method: METHOD };
export type OrphanRequestOptions = Partial<Pick<ActionRequest, 'uri' | 'query' | 'body' | 'requestOptions' | 'useCache' | 'cacheMillSeconds' >> & { uri: string };

export type RequestSubscriber<CustomData, Response, Payload> = {
  when: string;
  effect: (state: State<CustomData>, action: ReducerAction<Response, Payload>) => StateReturn<CustomData>;
};

export interface RequestActionNoMeta<Data, A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload, M>, Response, Payload, M = false> extends RequestAction<Data, A, Response, Payload, M> {
  (...args: Parameters<A>): FetchHandle<Response, Payload>;
}

export interface RequestActionWithMeta<Data, A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload, true>, Response, Payload> extends RequestAction<Data, A, Response, Payload, true> {
  (...args: Parameters<A>): FetchHandle<Response, Payload>;

  loading: boolean;
  meta: Meta;

  useMeta(): Meta;
  useMeta<T extends keyof Meta>(key?: T): Meta[T];
  useLoading(): boolean;
}

export interface RequestActionWithMetas<Data, A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Response, Payload, M> extends RequestAction<Data, A, Response, Payload, M> {
  (...args: Parameters<A>): FetchHandle<Response, Payload>;

  loadings: MetasLoading<M>;
  metas: Metas<M>;

  useMetas(): Metas<M>;
  useMetas(value: M): Meta;
  useMetas<T extends keyof Meta>(value: M, metaKey: T): Meta[T];

  useLoadings(): MetasLoading<M>;
  useLoadings(value: M): boolean;
}

export interface NormalActionAlias<Data, A extends (...args: any[]) => ActionNormalHandle<Data, Payload>, Payload> extends NormalAction<Data, A, Payload> {
  (...args: Parameters<A>): ReturnType<A>;
}

export type NormalSubscriber<CustomData, Payload> = {
  when: string;
  effect: (state: State<CustomData>, action: ActionNormal<Payload>) => StateReturn<CustomData>;
};

type EnhanceData<T> = T extends (...args: any[]) => HttpServiceHandle<infer D, any, any, any> ? D : never;
type EnhanceResponse<T> = T extends (...args: any[]) => HttpServiceHandle<any, infer R, any, any> ? R : never;
type EnhancePayload<T> = T extends (...args: any[]) => HttpServiceHandle<any, any, infer P, any> ? P : never;
type EnhanceMeta<T> = T extends (...args: any[]) => HttpServiceWithMetas<any, any, any, infer P> ? P : never;

export type ExtractNormalPayload<A> = A extends (state: any, payload: infer P) => any ? P : never;
export type ExtractNormalAction<A> = A extends (state: any, ...args: infer P) => any ? (...args: P) => ActionNormalHandle<any, P[0]> : never;

export interface HttpTransform {
  httpStatus?: HTTP_STATUS_CODE;
  message?: string;
  businessCode?: string;
}

export class HttpServiceNoMeta<Data, Response, Payload, M = false> extends HttpServiceHandle<Data, Response, Payload, M> {
  // @ts-ignore
  private readonly _: string = '';
}

export class HttpServiceWithMeta<Data, Response, Payload, M = true> extends HttpServiceHandle<Data, Response, Payload, M> {
  // @ts-ignore
  private readonly _: string = '';
}

export class HttpServiceWithMetas<Data, Response, Payload, M> extends HttpServiceHandle<Data, Response, Payload, M> {
  // @ts-ignore
  private readonly _: string = '';
}

export interface BaseHttpServiceConfig {
  baseUrl: string;
  onShowSuccess: (successText: string, action: ReducerAction) => void;
  onShowError: (errorText: string, action: ReducerAction) => void;
  timeoutMessage?: (originalText: string) => string;
  networkErrorMessage?: (originalText: string) => string;
}
