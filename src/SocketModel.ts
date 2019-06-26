import { NormalModel } from './NormalModel';

export abstract class SocketModel<Payload extends RM.AnyObject = {}> extends NormalModel<RM.DoNotUseReducer, Payload> {
  public abstract action(...args: any[]): RM.SocketAction<Payload>;

  protected createAction(payload: Payload): RM.SocketAction<Payload> {
    return {
      type: this.successType,
      middleware: this.getMiddlewareName(),
      payload,
    };
  }

  protected getInitValue(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: getInitValue`);
  }

  protected onSuccess(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }

  protected abstract getMiddlewareName(): string;
}
