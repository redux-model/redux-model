import { Model } from './Model';
import { useSelector } from 'react-redux';

export abstract class ReducerModel<Data = {}> extends Model<Data> {
  public hookRegister(): RM.HookRegister {
    return {
      [`reducer_${this.typePrefix}`]: this.createData(),
    };
  }

  public stateToData<T = Data>(state: any, filter?: (data: Data) => T): T {
    const data = state[`reducer_${this.typePrefix}`];

    return filter ? filter(data) : data;
  }

  public useData<T = Data>(filter?: (data: Data) => T): T {
    return useSelector((state: {}) => {
      return filter
        ? filter(state[`reducer_${this.typePrefix}`])
        : state[`reducer_${this.typePrefix}`];
    });
  }

  protected onSuccess(): Data & RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}
