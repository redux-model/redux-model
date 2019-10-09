import { BaseModel } from '../core/BaseModel';
import { RequestOptions, UseSelector } from '../core/utils/types';
import { FetchHandle } from './types';

export declare abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
