import { BaseRequestAction } from '../core/action/BaseRequestAction';
import { useSelector } from '@tarojs/redux';
import { FetchHandle } from './types';
import { UseSelector } from '../core/utils/types';

export class RequestAction<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends BaseRequestAction<Data, A, Response, Payload> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return useSelector;
  }
}
