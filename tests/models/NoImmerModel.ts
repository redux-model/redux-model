import { BaseTestModel } from './BaseTestModel';
import { State } from '../../src/core/utils/types';

type Data = string;

export class NoImmerModel extends BaseTestModel<Data> {
  public lastState?: State<Data>;

  changeData = this.action((state) => {
    this.lastState = state;

    return 'bar';
  });

  dontReturnValue = this.action(() => {});

  protected initReducer(): Data {
    return 'foo';
  }
}

export const noImmerModel = new NoImmerModel();
