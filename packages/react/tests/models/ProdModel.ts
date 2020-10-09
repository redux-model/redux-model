import { TestModel } from '../libs/TestModel';
import { $api } from '../libs/ApiService';

interface Data {
  hello?: string;
}

export class ProdModel extends TestModel<Data> {
  test1 = this.action(() => {});

  test2 = $api.action(() => {
    return this.get('/');
  });

  protected initialState(): Data {
    return {};
  }
}
