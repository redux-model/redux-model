import { useSelector } from 'react-redux';
import { BaseRequestAction } from '../core/action/BaseRequestAction';
import { IsPayload, UseSelector } from '../core/utils/types';
import { HttpServiceHandle } from '../core/service/HttpServiceHandle';

export class RequestAction<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload, M extends IsPayload<Payload>> extends BaseRequestAction<Data, A, Response, Payload, M> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return useSelector;
  }
}
