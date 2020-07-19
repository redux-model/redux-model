import { Model } from '../../src';
import { $api } from '../libs/ApiService';

interface Data {
  hello?: string;
}

export class ProdModel extends Model<Data> {
  test1 = this.action(() => {});

  test2 = $api.action(() => {
    return this.get('/');
  });

  protected initReducer(): Data {
    return {};
  }
}
