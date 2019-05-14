import { Dispatch } from 'redux';
import { Model } from './Model';

// Action + Reducer
export abstract class NormalModel<Data = {}, Payload extends AnyObject = {}> extends Model<Data> {
  constructor(name: string = '') {
    super(name);
    this.action = this.action.bind(this);
  }

  public abstract action(...args: any[]): NormalAction<Payload>;

  public dispatch(dispatch: Dispatch, action: NormalAction<Payload>): NormalAction<Payload> {
    return dispatch(action);
  }

  protected createAction(payload: Payload): NormalAction<Payload> {
    return {
      type: this.successType,
      payload,
    };
  }

  protected abstract onSuccess(state: Data, action: NormalAction<Payload>): Data;
}
