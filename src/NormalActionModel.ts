import { NormalModel } from './NormalModel';
import { AnyObject } from './Model';

interface Data {
  DO_NOT_USE_REDUCER: true;
}

// Action only
export abstract class NormalActionModel<Payload extends AnyObject = {}> extends NormalModel<Data, Payload> {
  protected getInitValue(): Data {
    throw new Error(`[${this.constructor.name}] Do not use method: getInitValue`);
  }

  protected onSuccess(): Data {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}
