import { ActionResponse, HttpTransform, RequestOptions } from '../utils/types';
import { METHOD } from '../utils/method';
import { HttpServiceHandle } from './HttpServiceHandle';

export abstract class BaseHttpService {
  public get<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.get);
  }

  public post<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.post);
  }

  public put<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.put);
  }

  public delete<Response, Payload>(config: RequestOptions<Response, Payload>): HttpServiceHandle<Response, Payload> {
    return new HttpServiceHandle(config, this).setMethod(METHOD.delete);
  }

  public abstract runAction(action: any): any;

  // @ts-ignore
  protected beforeSend(action: any) {};

  protected timeoutMessage(originalMessage: string): string {
    return originalMessage;
  }

  protected networkErrorMessage(originalMessage: string): string {
    return originalMessage;
  }

  protected abstract baseUrl(): string;

  protected abstract onShowSuccess(message: string, action: ActionResponse): void;
  protected abstract onShowError(message: string, action: ActionResponse): void;

  protected abstract onRespondError(error: any, transform: HttpTransform): void;

  protected abstract headers(action: any): object;

  protected helperShowError(errorResponse: ActionResponse, hideError: boolean | ((response: ActionResponse) => boolean)) {
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
