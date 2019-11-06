import { BaseRequestAction } from '../core/action/BaseRequestAction';
import * as TaroRedux from '@tarojs/redux';
import { UseSelector } from '../core/utils/types';
import { HttpServiceBuilder } from '../core/service/HttpServiceBuilder';

export class RequestAction<Data, A extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, M>, Response, Payload, M> extends BaseRequestAction<Data, A, Response, Payload, M> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return TaroRedux.useSelector;
  }
}
