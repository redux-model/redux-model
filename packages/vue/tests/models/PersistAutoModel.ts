import { PersistModel } from './PersistModel';

export class PersistAutoModel extends PersistModel {
  protected autoRegister(): boolean {
    return true;
  }
}
