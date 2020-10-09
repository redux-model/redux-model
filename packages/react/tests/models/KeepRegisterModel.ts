import { TestModel } from '../libs/TestModel';

interface Data {
  count: number;
}

export class KeepRegisterModel extends TestModel<Data> {
  protected readonly stateCount: number;

  constructor(count: number = 0, alias: string = '') {
    super(alias);
    this.stateCount = count;
  }

  test = this.action(() => {});

  protected initialState(): Data {
    return {
      count: this.stateCount,
    };
  }
}
