import { Action } from 'redux';
import { METHOD } from './method';
import { HTTP_STATUS_CODE } from './httpStatusCode';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { NormalAction } from '../action/NormalAction';

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
  [key in keyof T]: T[key] extends (...args: any[]) => infer R ? R : never;
};

// Omit is a new feature since typescript 3.5+
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export type UseSelector<TState, TSelected> = (
  selector: (state: TState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) => TSelected;

export type Effects<Data> = Array<{
  when: string;
  effect: (state: Data, action: any) => Data;
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
  middleware: string;
  method: METHOD;
  uri: string;
  body: object;
  query: object;
  successText: string;
  hideError: boolean | ((response: ActionResponse) => boolean);
  requestOptions: object;
}

export interface ActionResponse<Response = any, Payload = any> extends ActionNormal<Payload, string> {
  response: Response;
  errorMessage?: string;
  httpStatus?: HTTP_STATUS_CODE;
  businessCode?: string;
}


export type RequestOptions<Payload> = (
  Partial<Omit<ActionRequest, 'uri' | 'payload' | 'type' | 'method'>>
  & { uri: string; }
  & (Payload extends undefined ? { payload?: never } : { payload: Payload })
  );

export type PayloadData = string | number | symbol;

export type PayloadKey<A> =  A extends (...args: any[]) => FetchHandle<any, infer P> ? keyof P : never;

export type RequestSubscriber<CustomData, Response, Payload> = {
  when: string;
  effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData;
};

export interface RequestActionParamBase<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> {
  action: A;
  onSuccess?: (state: Data, action: ActionResponse<Response, Payload>) => Data;
  onPrepare?: (state: Data, action: ActionResponse<Response, Payload>) => Data;
  onFail?: (state: Data, action: ActionResponse<Response, Payload>) => Data;
}

export interface RequestActionParamNoMeta<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends RequestActionParamBase<Data, A, Response, Payload> {
  meta: false;
}

export interface RequestActionParamWithMeta<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends RequestActionParamBase<Data, A, Response, Payload> {
  meta?: true;
}

export interface RequestActionParamWithMetas<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends RequestActionParamBase<Data, A, Response, Payload> {
  meta: PayloadKey<A>;
}

// @ts-ignore
export interface RequestActionNoMeta<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends NormalAction<Data, A, Payload> {
  readonly action: A;

  // @ts-ignore
  onSuccess<CustomData>(effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;
  onPrepare<CustomData>(effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;
  onFail<CustomData>(effect: (state: CustomData, action: ActionResponse<Response, Payload>) => CustomData): RequestSubscriber<CustomData, Response, Payload>;

  getPrepareType(): string;
  getFailType(): string;
}

export interface RequestActionWithMeta<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends RequestActionNoMeta<Data, A, Response, Payload> {
  useMeta<T = Meta>(filter?: (meta: Meta) => T): T;
  useLoading(): boolean;
  connectMeta(rootState: any): Meta;
  connectLoading(rootState: any): boolean;
}

export interface RequestActionWithMetas<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends RequestActionNoMeta<Data, A, Response, Payload> {
  useMetas(): Metas;
  useMetas<T = Meta>(payloadData: PayloadData, filter?: (meta: Meta) => T): T;
  useLoading(payloadData: PayloadData): boolean;
  connectMetas(rootState: any): Metas;
  connectMetas(rootState: any, payloadData: PayloadData): Meta;
  connectLoading(rootState: any, payloadData: PayloadData): boolean;
}

export interface NormalActionParam<Data, A extends (...args: any[]) => ActionNormal<Payload>, Payload> {
  action: A;
  onSuccess?: (state: Data, action: ActionNormal<Payload>) => Data;
}

export type NormalSubscriber<CustomData, Payload> = {
  when: string;
  effect: (state: CustomData, action: ActionNormal<Payload>) => CustomData;
};
