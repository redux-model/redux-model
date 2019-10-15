import { Store } from 'redux';
import {
  Effects,
  EnhancePayload,
  EnhanceResponse,
  ExtractNormalAction,
  ExtractNormalPayload,
  NormalActionAlias,
  PayloadKey,
  Reducers,
  RequestActionNoMeta,
  RequestActionParamNoMeta,
  RequestActionParamWithMeta,
  RequestActionParamWithMetas,
  RequestActionWithMeta,
  RequestActionWithMetas,
  State,
  StateReturn,
  IsPayload,
} from './utils/types';
import { Uri } from './utils/Uri';
import { HttpServiceHandle } from './service/HttpServiceHandle';

export declare abstract class BaseModel<Data = null> {
  // As we know, it's forbidden to make condition when we are using hooks.
  // We can't write code like: xxxModel.xxx.useLoading() || xxxModel.yyy.useLoading()
  // So, just write code like: Model.isLoading(xxxModel.xxx.useLoading(), xxxModel.yyy.useLoading());
  static isLoading(...fromUseLoading: boolean[]): boolean;

  // Remember:
  // can be used anywhere except component.
  // For component, just inject data by react-redux.connect().
  // For react-hooks, just invoke useData() without connect().
  readonly data: Data;

  constructor(alias?: string);

  register(): Reducers;

  // Remember:
  // method `useData` is specific used in function component base on hooks.
  // Make sure React version >=16.8 and react-redux version >=7.1.0
  useData(): Data;
  useData<T = Data>(filter?: (data: Data) => T): T;

  // Do anything as in constructor.
  protected onInit(): void;

  // Do anything after reducer is generated.
  protected onReducerCreated(store: Store): void;

  protected changeReducer(fn: (state: State<Data>) => StateReturn<Data>): void;

  protected action<A extends (state: State<Data>, payload: any) => StateReturn<Data>>(
    changeReducer: A
  ): NormalActionAlias<Data, ExtractNormalAction<A>, ExtractNormalPayload<A>>;

  // Case meta is false. We will never create meta reducer for this action.
  protected action<A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    request: RequestActionParamNoMeta<Data, A, Response, Payload>
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  // Case meta is undefined or true. we will automatically register meta reducer.
  protected action<A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    request: RequestActionParamWithMeta<Data, A, Response, Payload>
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  // Case meta is one of payload's key. we will automatically register metas reducer.
  protected action<A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M extends IsPayload<Payload> = PayloadKey<A>>(
    request: RequestActionParamWithMetas<Data, A, Response, Payload, M>
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  protected uri<Response>(uri: string): Uri<Response>;

  protected effects(): Effects<Data>;
  protected autoRegister(): boolean;
  protected abstract initReducer(): Data;
}
