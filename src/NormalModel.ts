import { Model } from './Model';
import { useSelector } from 'react-redux';

export abstract class NormalModel<Data = {}, Payload extends RM.AnyObject = {}> extends Model<Data> {
  constructor(instanceName: string = '') {
    super(instanceName);
    this.action = this.action.bind(this);
  }

  public abstract action(...args: any[]): RM.NormalAction<Payload>;

  public hookRegister(): RM.HookRegister {
    return {
      [`normal_${this.typePrefix}`]: this.createData(),
    };
  }

  public stateToData<T = Data>(state: any, filter?: (data: Data) => T): T {
    const data = state[`normal_${this.typePrefix}`];

    return filter ? filter(data) : data;
  }

  public useData<T = Data>(filter?: (data: Data) => T): T {
    return useSelector((state: {}) => {
      return filter
        ? filter(state[`normal_${this.typePrefix}`])
        : state[`normal_${this.typePrefix}`];
    });
  }

  protected createAction(payload: Payload): RM.NormalAction<Payload> {
    return {
      type: this.successType,
      payload,
    };
  }

  protected abstract onSuccess(state: Data, action: RM.NormalAction<Payload>): Data;
}
