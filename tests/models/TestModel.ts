import { Model } from "../../src/web";

interface Data {
  id: number;
  name: string;
  age?: number;
}

export class TestModel extends Model<Data> {
  modify = this.actionNormal((state, payload: Partial<Data>) => {
    Object.assign(state, payload);
  });

  returnNewObject = this.actionNormal(() => {
    return {
      id: 100,
      name: 'peter',
      age: 20,
    };
  });

  effectOtherModel = this.actionNormal(() => {});

  effectWithPayload = this.actionNormal((_, __: { counter: number }) => {});

  modifyByMethod(id: number) {
    this.changeReducer((state) => {
      state.id = id;
    });
  }

  protected initReducer(): Data {
    return {
      id: 1,
      name: 'init-name',
    };
  }
}

export const testModel = new TestModel();
