import { Model } from '../../src';
import { $api } from './ApiService';

interface Data {
  hello?: string;
}

export class ProdModel extends Model<Data> {
  test1 = this.action(() => {});

  // FIXME: null data 时报错
  test2 = $api.action(() => {
    return this.get('/');
  });

  test3 = this.compose(async () => {});

  protected initReducer(): Data {
    return {};
  }
}
