import { Store } from 'redux';
import {
  Effects,
  ExtractNormalAction,
  ExtractNormalPayload,
  HttpServiceWithMeta,
  NormalActionAlias,
  Reducers,
  State,
  StateReturn,
} from './utils/types';

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

  getReducerName(): string;

  register(): Reducers;

  // Remember:
  // method `useData` is specific used in function component base on hooks.
  // Make sure React version >=16.8 and react-redux version >=7.1.0
  useData(): Data;
  useData<T = Data>(filter: (data: Data) => T): T;

  // Do anything as in constructor.
  protected onInit(): void;

  // Do anything after reducer is generated.
  protected onReducerCreated(store: Store): void;

  protected changeReducer(fn: (state: State<Data>) => StateReturn<Data>): void;

  protected action<A extends (state: State<Data>, payload: any) => StateReturn<Data>>(
    changeReducer: A
  ): NormalActionAlias<Data, ExtractNormalAction<A>, ExtractNormalPayload<A>>;

  protected get<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown>;
  protected post<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown>;
  protected put<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown>;
  protected delete<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown>;

  protected effects(): Effects<Data>;
  protected autoRegister(): boolean;
  protected abstract initReducer(): Data;
}
