import { $api } from './ApiService';
import { BaseTestModel } from './BaseTestModel';

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

export class RequestModel extends BaseTestModel<Data> {
  getProfile = this.actionRequest({
    action: () => {
      return $api.get({
        uri: this.uri<Response>('/profile.json'),
      });
    },
    onPrepare: (state) => {
      Object.assign(state, {
        id: 666,
        name: 'iPhone',
      });
    },
    onSuccess: (state, action) => {
      Object.assign(state, action.response);
    },
    onFail: (state) => {
      Object.assign(state, {
        id: 1000,
        name: 'nokia',
      });
    },
  });

  getNpmInfo = this.actionRequest({
    action: (packageName: string) => {
      return $api.get({
        uri: this.uri('https://registry.npmjs.org/' + packageName),
      });
    },
  });

  getNpmInfoWithTimeout = this.actionRequest({
    action: (packageName: string) => {
      return $api.get({
        uri: this.uri('https://registry.npmjs.org/' + packageName),
        requestOptions: {
          timeout: 2, // million second
        },
      })
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
