import { BaseTestModel } from './BaseTestModel';

interface Data {
  counter: number;
}

export class PersistModel extends BaseTestModel<Data> {
  increase = this.action((state) => {
    state.counter += 1;
  });

  protected initReducer(): Data {
    return {
      counter: 0,
    };
  }
}

export const persistModel = new PersistModel();
