import { BaseModel } from '../core/BaseModel';
import * as ReactRedux from 'react-redux';
import { UseSelector } from '../core/utils/types';

export abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return ReactRedux.useSelector;
  }
}
