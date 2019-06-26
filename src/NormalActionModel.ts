import { NormalModel } from './NormalModel';

export abstract class NormalActionModel<Payload extends RM.AnyObject = {}> extends NormalModel<RM.DoNotUseReducer, Payload> {
  protected getInitValue(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: getInitValue`);
  }

  protected onSuccess(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}
