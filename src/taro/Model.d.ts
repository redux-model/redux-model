import { BaseModel } from '../core/BaseModel';
import { HttpServiceWithMeta, UseSelector } from '../core/utils/types';

export declare abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;

  protected connect<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown>;

  protected trace<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown>;
}
