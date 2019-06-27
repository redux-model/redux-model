import { RequestModel } from './RequestModel';

export abstract class RequestActionModel<Response = {}, Payload = {}> extends RequestModel<RM.DoNotUseReducer, Response, Payload> {
  protected getInitValue(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: getInitValue`);
  }

  protected onSuccess(): RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}
