import { TestModel } from '../libs/TestModel';

interface Data {
  counter: number;
}

export class ResetStoreModel extends TestModel<Data> {
  plus = this.action((state) => {
    state.counter += 1;
  });

  protected initialState(): Data {
    return {
      counter: 0,
    };
  }
}


export class KeepStoreModel extends TestModel<Data> {
  plus = this.action((state) => {
    state.counter += 1;
  });

  public/*protected*/ keepOnResetStore(): boolean {
    return true;
  }

  protected initialState(): Data {
    return {
      counter: 0,
    };
  }
}
