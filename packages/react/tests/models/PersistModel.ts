import { TestModel } from '../libs/TestModel';

interface Data {
  counter: number;
}

export class PersistModel extends TestModel<Data> {
  count = 0;

  increase = this.action((state) => {
    state.counter += 1;
  });

  protected initialState(): Data {
    return {
      counter: 0,
    };
  }

  protected onStoreCreated() {
    this.count = this.data.counter;
  }
}

export const persistModel = new PersistModel();
