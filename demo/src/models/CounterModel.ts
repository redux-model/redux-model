import { Model } from '../../../src';

type Data = {
  amount: number;
};

class CounterModel extends Model<Data> {
  increase = this.actionNormal({
    action: () => {
      return this.emit();
    },
    onSuccess: (state) => {
      return {
        amount: state.amount + 1,
      };
    },
  });

  reset = this.actionNormal({
    action: () => {
      return this.emit();
    },
    onSuccess: () => {
      return {
        amount: 0,
      };
    },
  });

  protected getInitValue(): Data {
    return {
      amount: 0,
    };
  }
}

export const counterModel = new CounterModel();
