import { $api } from './ApiService';
import { BaseTestModel } from './BaseTestModel';

interface Response {
  id: number;
  name: string;
  age?: number;
}

type Data = Response;

export class BasicModel extends BaseTestModel<Data> {
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

  getProfile = this.actionRequest({
    action: () => {
      return $api.get({
        uri: this.uri<Response>('/profile.json'),
      });
    },
    onSuccess: (_, action) => {
      return action.response;
    },
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

export const basicModel = new BasicModel();
