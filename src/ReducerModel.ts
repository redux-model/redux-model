import { Model } from './Model';

// Reducer only
export abstract class ReducerModel<Data = {}> extends Model<Data> {
  protected onSuccess(): Data & RM.DoNotUseReducer {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}
