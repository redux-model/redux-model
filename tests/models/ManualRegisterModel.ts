import { Model } from '../../src/web';

interface Data {
  foo: string,
}

export class ManualRegisterModel extends Model<Data> {
  modify = this.actionNormal((state) => {
    state.foo = 'bar';
  });

  testChangeReducer(name: string) {
    this.changeReducer((state) => {
      state.foo = name;
    });
  }

  protected initReducer(): Data {
    return {
      foo: 'foo',
    };
  }

  protected autoRegister(): boolean {
    return false;
  }
}

export const manualRegisterModel = new ManualRegisterModel();
