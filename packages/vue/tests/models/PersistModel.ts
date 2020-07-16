import { Model } from '../../src/models/Model';

interface Data {
  counter: number;
}

export class PersistModel extends Model<Data> {
  increase = this.action((state) => {
    state.counter += 1;
  });

  protected initReducer(): Data {
    return {
      counter: 0,
    };
  }

  // filterPersistData: FilterPersist<Data> = (state) => {

  // };

  protected autoRegister(): boolean {
    return false;
  }
}

export const persistModel = new PersistModel();
