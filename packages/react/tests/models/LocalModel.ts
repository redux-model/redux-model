import { Model } from '../../src';

interface Data {
  counter: number;
}

export class LocalModel extends Model<Data> {
  plus = this.action((state, payload: number) => {
    state.counter += payload;
  });

  protected initialState(): Data {
    return { counter: 0 };
  }
}
