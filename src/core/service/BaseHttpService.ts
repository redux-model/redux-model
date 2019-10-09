import { ActionResponse, OrphanRequestOptions, RequestOptions } from '../utils/types';
import { METHOD } from '../utils/method';
import { HttpServiceHandle } from './HttpServiceHandle';
import { OrphanHttpServiceHandle } from './OrphanHttpServiceHandle';
import { FetchHandle } from '../../libs/types';
import { Action } from 'redux';
import { getStore } from '../utils/createReduxStore';

export abstract class BaseHttpService {
  public get<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.get);
  }

  public getAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.get)
      .runAction();
  }

  public post<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.post);
  }

  public postAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.post)
      .runAction();
  }

  public put<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.put);
  }

  public putAsync<Response>(config: OrphanRequestOptions): FetchHandle<Response, never> {
    return new OrphanHttpServiceHandle<Response>(config, this)
      .setMethod(METHOD.put)
      .runAction();
  }

  public delete<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.delete);
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

  protected _next(action: Action): void {
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
