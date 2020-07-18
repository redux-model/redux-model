import { PersistModel } from './PersistModel';
import { FilterPersist } from '@redux-model/core';

interface Data {
  counter: number;
}

export class PersistAutoModel extends PersistModel {
  filterPersistData(): FilterPersist<Data> {
    return (state) => {
      state.counter += 10;
    };
  }

  protected autoRegister(): boolean {
    return true;
  }
}
