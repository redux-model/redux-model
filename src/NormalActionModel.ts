import { NormalModel } from './NormalModel';

interface DenyData {
  DO_NOT_USE_REDUCER: true;
}

// Action only
export abstract class NormalActionModel<Payload extends AnyObject = {}> extends NormalModel<DenyData, Payload> {
  protected getInitValue(): DenyData {
    throw new Error(`[${this.constructor.name}] Do not use method: getInitValue`);
  }

  protected onSuccess(): DenyData {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}
