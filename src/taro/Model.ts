import { BaseModel } from '../core/BaseModel';
import { getTaroRedux } from './getTaro';
import { HttpServiceWithMeta, UseSelector } from '../core/utils/types';
import { METHOD } from '../core/utils/method';

export abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return getTaroRedux().useSelector;
  }

  protected connect<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown> {
    return this.serviceAction<Response>(uri, METHOD.connect);
  }

  protected trace<Response>(uri: string): HttpServiceWithMeta<Data, Response, unknown> {
    return this.serviceAction<Response>(uri, METHOD.trace);
  }
}
