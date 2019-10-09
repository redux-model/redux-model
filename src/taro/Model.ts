import { BaseModel } from '../core/BaseModel';
import * as TaroRedux from '@tarojs/redux';
import { UseSelector } from '../core/utils/types';

export abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return TaroRedux.useSelector;
  }
}
