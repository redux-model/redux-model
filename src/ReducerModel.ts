import { Model } from './Model';

interface DenyData {
  DO_NOT_USE_REDUCER: true;
}

// Reducer only
export abstract class ReducerModel<Data = {}> extends Model<Data> {
  protected onSuccess(): Data & DenyData {
    throw new Error(`[${this.constructor.name}] Do not use method: onSuccess`);
  }
}
