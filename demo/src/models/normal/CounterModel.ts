import { NormalModel } from '../../../../src';
import { resetModel } from './ResetModel';

type Data = {
  amount: number;
};

class CounterModel extends NormalModel<Data> {
  action(): RM.NormalAction {
    return this.createAction({});
  }

  protected getInitValue(): Data {
    return {
      amount: 0,
    };
  }

  protected onSuccess(state: Data/*, action: RM.NormalAction */): Data {
    return {
      amount: state.amount + 1,
    };
  }

  protected getEffects(): RM.ReducerEffects<Data> {
    return [
      {
        when: resetModel.getSuccessType(),
        effect: (/* state, action */) => {
          return {
            amount: 0,
          };
        },
      }
    ];
  }
}

export const counterModel = new CounterModel();
