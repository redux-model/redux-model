import { NormalActionModel } from '../../../../src';

class ResetNpmInfoModel extends NormalActionModel {
  action(): RM.NormalAction {
    return this.createAction({});
  }
}

export const resetNpmInfoModel = new ResetNpmInfoModel();
