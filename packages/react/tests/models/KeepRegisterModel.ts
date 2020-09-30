import { keepRegister } from '@redux-model/core';
import { Model } from '../../src';

interface Data {
  count: number;
}

export class KeepRegisterModel extends Model<Data> {
  protected readonly stateCount: number;

  constructor(count: number = 0, alias: string = '') {
    const register = keepRegister(KeepRegisterModel);
    super(alias);
    this.stateCount = count;
    register();
  }

  protected initialState(): Data {
    return {
      count: this.stateCount,
    };
  }
}
