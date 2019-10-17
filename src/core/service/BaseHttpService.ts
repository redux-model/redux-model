import {
  ActionResponse,
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
  RequestActionWithMetas
} from '../utils/types';
import { METHOD } from '../utils/method';
import { OrphanHttpServiceHandle } from './OrphanHttpServiceHandle';
import { ActionRequest, FetchHandle } from '../../libs/types';
import { AnyAction } from 'redux';
import { getStore } from '../utils/createReduxStore';
import { RequestAction } from '../../libs/RequestAction';
import { getInstanceName, increaseActionCounter } from '../utils/instanceName';
import { isDebug } from '../../libs/dev';
import { isProxyEnable } from '../utils/dev';

export abstract class BaseHttpService {
  public get<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  public get<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public get<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M extends keyof Payload = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public get(fn: any): any {
    return this.actionRequest(fn, METHOD.get);
  }

  public getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.get)
      .runAction();
  }

  public post<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  public post<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public post<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public post(fn: any): any {
    return this.actionRequest(fn, METHOD.post);
  }

  public postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.post)
      .runAction();
  }

  public put<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  public put<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public put<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public put(fn: any): any {
    return this.actionRequest(fn, METHOD.put);
  }

  public putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.put)
      .runAction();
  }

  public delete<A extends (...args: any[]) => HttpServiceNoMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionNoMeta<Data, A, Response, Payload>;

  public delete<A extends (...args: any[]) => HttpServiceWithMeta<Data, Response, Payload>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>>(
    fn: A
  ): RequestActionWithMeta<Data, A, Response, Payload>;

  public delete<A extends (...args: any[]) => HttpServiceWithMetas<Data, Response, Payload, M>, Data = EnhanceData<A>, Response = EnhanceResponse<A>, Payload = EnhancePayload<A>, M = EnhanceMeta<A>>(
    fn: A
  ): RequestActionWithMetas<Data, A, Response, Payload, M>;

  public delete(fn: any): any {
    return this.actionRequest(fn, METHOD.delete);
  }

  public deleteAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.delete)
      .runAction();
  }

  // TODO: 从.d.ts移除
  protected actionRequest(fn: any, method: METHOD): any {
    let instanceName = getInstanceName();

    if (!isDebug() || !isProxyEnable()) {
      instanceName += '_' + increaseActionCounter();
    }

    return new RequestAction(fn, instanceName, (action: ActionRequest) => {
      action.method = method;

      return this.runAction(action);
    });
  }

  protected abstract runAction(action: any): any;

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

  protected _triggerShowError(errorResponse: ActionResponse, hideError: boolean | ((response: ActionResponse) => boolean)) {
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
