import { $api } from '../libs/ApiService';
import { Model } from '../../src/models/Model';

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

  enableThrottleProfile = $api.action(() => {
    return this
      .get<{ id: number }>('/profile/manage')
      .throttle(3000);
  });

  disableCacheProfile = $api.action(() => {
    return this
      .get<{ id: number }>('/profile/manage')
      .throttle({
        duration: 3000,
        enable: false,
      });
  });

  configurableThrottle = $api.action((useCache: boolean) => {
    return this
    .get<{ id: number }>('/profile/manage')
    .throttle({
      duration: 3000,
      enable: useCache,
    });
  });

  getProfileById = $api.action((id: number) => {
    return this
      .get<Response>('/profile.json')
      .metas(id)
      .onSuccess((state, action) => {
        state.records[id] = action.response;
      });
  });

  payloadRequest = $api.action((who: string) => {
    return this
      .get<Response>('/profile.json')
      .payload({
        who,
      });
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

export const requestModel = new RequestModel('default');
