import { BaseRequestAction } from '../core/action/BaseRequestAction';
import { useComputed } from 'vue-hooks';
import { UseSelector } from '../core/utils/types';
import { HttpServiceBuilder } from '../core/service/HttpServiceBuilder';
import { getStore } from '../core/utils/createReduxStore';

export class RequestAction<Data, A extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, M>, Response, Payload, M> extends BaseRequestAction<Data, A, Response, Payload, M> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return useComputed.bind(getStore().getState());
  }
}
