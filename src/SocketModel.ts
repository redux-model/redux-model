import { Dispatch } from 'redux';
import { NormalModel } from './NormalModel';

interface DenyData {
  DO_NOT_USE_REDUCER: true;
}

// SocketAction
export abstract class SocketModel<Payload extends AnyObject = {}> extends NormalModel<DenyData, Payload> {
  public dispatch(dispatch: Dispatch, action: SocketAction<Payload>): SocketAction<Payload> {
    return dispatch(action);
  }

  public abstract action(...args: any[]): SocketAction<Payload>;

  protected createAction(payload: Payload): SocketAction<Payload> {
    return {
      type: this.successType,
      middleware: this.getMiddlewareName(),
      payload,
    };
  }

  protected getInitValue(): DenyData {
    throw new Error(`[${this.constructor.name}] Do not use method: getInitValue`);
  }

  protected onSuccess(): DenyData {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }

  protected abstract getMiddlewareName(): string;
}
