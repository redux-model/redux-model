import {
  InternalActionResponse,
  EnhanceData,
  EnhanceMeta,
  EnhancePayload,
  EnhanceResponse,
  HttpServiceNoMeta,
  HttpServiceWithMeta,
  HttpServiceWithMetas,
  OrphanRequestOptions,
  RequestActionNoMeta,
  RequestActionWithMeta,
  RequestActionWithMetas, ActionResponse
} from '../utils/types';
import { METHOD } from '../utils/method';
import { OrphanHttpServiceHandle } from './OrphanHttpServiceHandle';
import { FetchHandle } from '../../libs/types';
import { AnyAction } from 'redux';
import { getStore } from '../utils/createReduxStore';
import { RequestAction } from '../../libs/RequestAction';
import { getInstanceName, increaseActionCounter } from '../utils/instanceName';
import { isDebug } from '../../libs/dev';
import { isProxyEnable } from '../utils/dev';

export abstract class BaseHttpService {
  public action<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  public action<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public action<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public action(fn: any): any {
    let instanceName = getInstanceName();

    if (!isDebug() || !isProxyEnable()) {
      instanceName += '_' + increaseActionCounter();
    }

    return new RequestAction(fn, instanceName, this.runAction.bind(this));
  }

  public getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.get)
      .runAction();
  }

  public postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.post)
      .runAction();
  }

  public putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.put)
      .runAction();
  }

  public deleteAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.delete)
      .runAction();
  }

  public abstract runAction(action: any): any;

  protected timeoutMessage(originalMessage: string): string {
    return originalMessage;
  }

  protected networkErrorMessage(originalMessage: string): string {
    return originalMessage;
  }

  protected abstract baseUrl(): string;

  protected abstract onShowSuccess(successText: string, action: ActionResponse): void;
  protected abstract onShowError(errorText: string, action: ActionResponse): void;

  protected _next(action: AnyAction): void {
    if (action.type) {
      getStore().dispatch(action);
    }
  }

  protected _triggerShowError(errorResponse: InternalActionResponse, hideError: boolean | ((response: InternalActionResponse) => boolean)) {
    if (!errorResponse.errorMessage) {
      return;
    }

    let showError: boolean;

    if (typeof hideError === 'boolean') {
      showError = !hideError;
    } else {
      showError = !hideError(errorResponse);
    }

    if (showError) {
      this.onShowError(errorResponse.errorMessage, errorResponse);
    }
  }
}
