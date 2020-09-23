import { Model } from '../../src/models/Model';

interface Data {
  counter: number;
}

export class PersistModel extends Model<Data> {
  count = 0;

  increase = this.action((state) => {
    state.counter += 1;
  });

  protected initialState(): Data {
    return {
      counter: 0,
    };
  }

  protected autoRegister(): boolean {
    return false;
  }

  protected onStoreCreated() {
    this.count = this.data.counter;
  }
}

export const persistModel = new PersistModel();
