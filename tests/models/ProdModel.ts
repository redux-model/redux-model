import { BaseTestModel } from './BaseTestModel';
import { $api } from './ApiService';

interface Data {
  counter: number;
}

export class ProdModel extends BaseTestModel<Data> {
  increase = this.action((state) => {
    state.counter += 1;
  });

  fetchSomething = this.action({
    request: () => {
      return $api.get({
        uri: this.uri('/test'),
      });
    },
  });

  protected initReducer(): Data {
    return {
      counter: 0,
    };
  }
}

export const proxyModel = new ProdModel();
