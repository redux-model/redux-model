import { Model } from "../../src/web";
import { $api } from './ApiService';

interface Response {
  id: number;
  name: string;
  age?: number;
}

type Data = Response & {
  records: Partial<{
    [key: string]: {
      id: number;
      name: string;
      age?: number;
    };
  }>;
};

export class RequestModel extends Model<Data> {
  getProfile = this.actionRequest({
    action: () => {
      return $api.get({
        uri: this.uri<Response>('/profile.json'),
      });
    },
    onSuccess: (state, action) => {
      Object.assign(state, action.response);
    },
  });

  getProfileById = this.actionRequest({
    action: (id: number) => {
      return $api.get({
        uri: this.uri<Response>('/profile.json'),
        payload: {
          id,
        },
      });
    },
    onSuccess: (state, action) => {
      state.records[action.payload.id] = action.response;
    },
    meta: 'id',
  });

  async orphanGetRequest() {
    const profile = await $api.getAsync<Response>({
      uri: '/profile.json',
    });

    return profile.response;
  }

  protected initReducer(): Data {
    return {
      id: 1,
      name: 'init-name',
      records: {},
    };
  }
}

export const requestModel = new RequestModel();
