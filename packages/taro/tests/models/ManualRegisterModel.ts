import { Model } from '../../src/models/Model';

interface Data {
  foo: string,
}

export class ManualRegisterModel extends Model<Data> {
  modify = this.action((state) => {
    state.foo = 'bar';
  });

  testChangeState(name: string) {
    this.changeState((state) => {
      state.foo = name;
    });
  }

  protected initialState(): Data {
    return {
      foo: 'foo',
    };
  }

  protected autoRegister(): boolean {
    return false;
  }
}

export const manualRegisterModel = new ManualRegisterModel();
