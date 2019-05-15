import { Dispatch } from 'redux';
import { NormalModel } from './NormalModel';

interface DenyData {
  DO_NOT_USE_REDUCER: true;
}

// RM.SocketAction
export abstract class SocketModel<Payload extends RM.AnyObject = {}> extends NormalModel<DenyData, Payload> {
  public dispatch(dispatch: Dispatch, action: RM.SocketAction<Payload>): RM.SocketAction<Payload> {
    return dispatch(action);
  }

  public abstract action(...args: any[]): RM.SocketAction<Payload>;

  protected createAction(payload: Payload): RM.SocketAction<Payload> {
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
