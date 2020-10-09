import { $api } from '../libs/ApiService';
import { TestModel } from '../libs/TestModel';

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

export class RequestModel extends TestModel<Data> {
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

  withAfterXXX = $api.action(() => {
    return this
      .get<{ count: number }>('/')
      .afterPrepare(() => {
        this.changeState((state) => {
          state.id += 1;
        });
      })
      .afterSuccess((action) => {
        this.changeState((state) => {
          state.id += action.response.count;
        });
      })
      .afterFail(() => {
        this.changeState((state) => {
          state.id += 2;
        });
      });
  });

  withAfterXXXAndDuration = $api.action(() => {
    return this
      .get<{ count: number }>('/')
      .afterPrepare(() => {
        this.changeState((state) => {
          state.id += 1;
        });
      }, 50)
      .afterSuccess((action) => {
        this.changeState((state) => {
          state.id += action.response.count;
        });
      }, 200)
      .afterFail(() => {
        this.changeState((state) => {
          state.id += 2;
        });
      }, 250);
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

  protected initialState(): Data {
    return {
      id: 1,
      name: 'init-name',
      records: {},
    };
  }
}

export const requestModel = new RequestModel('default');
