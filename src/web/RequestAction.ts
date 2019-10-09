import { BaseRequestAction } from '../core/action/BaseRequestAction';
import { useSelector } from 'react-redux';
import { UseSelector } from '../core/utils/types';
import { HttpServiceHandle } from '../core/service/HttpServiceHandle';

export class RequestAction<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload> extends BaseRequestAction<Data, A, Response, Payload> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return useSelector;
  }
}
