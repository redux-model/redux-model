import { getModelName } from '@redux-model/core/src/utils/model';
import { Model } from '../../src';

export abstract class TestModel<Data = null> extends Model<Data> {
  // @ts-ignore
  constructor(alias: string = '') {
    // @ts-ignore
    this.getReducerName = () => this._name || getModelName(this, alias);
    super();
  }
}
