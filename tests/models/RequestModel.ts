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
  getProfile = $api.action(() => {
    return this
      .get<Response>('/profile.json')
      .onPrepare((state) => {
        Object.assign(state, {
          id: 666,
          name: 'iPhone',
        });
      })
      .onSuccess((state, action) => {
        Object.assign(state, action.response);
      })
      .onFail((state) => {
        Object.assign(state, {
          id: 1000,
          name: 'nokia',
        });
      });
  });

  withPostProfile = $api.action(() => {
    return this.post('/profile/create');
  });

  withPutProfile = $api.action(() => {
    return this.put('/profile/create');
  });

  withDeleteProfile = $api.action(() => {
    return this.delete('/profile/create');
  });

  getNpmInfo = $api.action((packageName: string) => {
    return this.get('https://registry.npmjs.org/' + packageName);
  });

  getNpmInfoWithTimeout = $api.action((packageName: string) => {
    return this
      .get('https://registry.npmjs.org/' + packageName)
      .requestOptions({
        timeout: 2, // million second
      })
  });

  getProfileById = $api.action((id: number) => {
    return this
      .get<Response>('/profile.json')
      .withMeta(id)
      .onSuccess((state, action) => {
        state.records[id] = action.response;
      });
  });

  noMetaRequest = $api.action(() => {
    return this
      .get<Response>('/profile.json')
      .withMeta(false);
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
