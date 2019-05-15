import { Dispatch } from 'redux';
import { Model } from './Model';

// Action + Reducer
export abstract class NormalModel<Data = {}, Payload extends RM.AnyObject = {}> extends Model<Data> {
  constructor(name: string = '') {
    super(name);
    this.action = this.action.bind(this);
  }

  public abstract action(...args: any[]): RM.NormalAction<Payload>;

  public dispatch(dispatch: Dispatch, action: RM.NormalAction<Payload>): RM.NormalAction<Payload> {
    return dispatch(action);
  }

  protected createAction(payload: Payload): RM.NormalAction<Payload> {
    return {
      type: this.successType,
      payload,
    };
  }

  protected abstract onSuccess(state: Data, action: RM.NormalAction<Payload>): Data;
}
