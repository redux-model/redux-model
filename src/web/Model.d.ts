import { BaseModel } from '../core/BaseModel';
import { UseSelector } from '../core/utils/types';

export declare abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected>;
}
