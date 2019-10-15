import { BaseTestModel } from './BaseTestModel';

interface Data {
  foo: string,
}

export class ManualRegisterModel extends BaseTestModel<Data> {
  modify = this.action((state) => {
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
