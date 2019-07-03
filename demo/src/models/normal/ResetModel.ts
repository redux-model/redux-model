import { NormalActionModel } from '../../../../src';

class ResetModel extends NormalActionModel {
  action(): RM.NormalAction {
    return this.createAction({});
  }
}

export const resetModel = new ResetModel();
