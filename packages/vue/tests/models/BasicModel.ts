import { $api } from '../libs/ApiService';
import { Model } from '../../src/models/Model';

interface Response {
  id: number;
  name: string;
  age?: number;
}

type Data = Response;

export class BasicModel extends Model<Data> {
  name = '';

  modify = this.action((state, payload: Partial<Data>) => {
    Object.assign(state, payload);
  });

  modifyWithAfter = this.action((state, payload: Partial<Data>) => {
    Object.assign(state, payload);
  }, {
    afterSuccess: (action) => {
      this.changeState((state) => {
        state.id += action.payload.id || 1;
      });
    },
  });

  modifyWithAfterAndDuration = this.action((state, payload: Partial<Data>) => {
    Object.assign(state, payload);
  }, {
    afterSuccess: (action) => {
      this.changeState((state) => {
        state.id += action.payload.id || 1;
      });
    },
    duration: 100,
  });

  returnNewObject = this.action(() => {
    return {
      id: 100,
      name: 'peter',
      age: 20,
    };
  });

  getProfile = $api.action(() => {
    return this
      .get<Response>('/profile.json')
      .onSuccess((_, action) => {
        return action.response;
      });
  });

  effectOtherModel = this.action(() => {});

  effectWithPayload = this.action((_, __: { counter: number }) => {});

  modifyByMethod(id: number) {
    this.changeState((state) => {
      state.id = id;
    });
  }

  allowGetData = this.action(() => {
    this.data;
  });

  protected initialState(): Data {
    return {
      id: 1,
      name: 'init-name',
    };
  }
  protected onStoreCreated() {
    this.name = this.data.name;
  }
}

export const basicModel = new BasicModel();
