import { BaseModel } from '../core/BaseModel';
import { HttpServiceWithMeta, UseSelector } from '../core/utils/types';

export declare abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;

  protected patch<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown>;
}
