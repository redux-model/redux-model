import { Model } from '../../../src';
import { counterModel } from './CounterModel';
import { npmInfoModel } from './NpmInfoModel';

interface Data {
  times: number;
  lastTime?: string;
}

class SummaryModel extends Model<Data> {
  protected initReducer(): Data {
    return {
      times: 0,
    };
  }

  protected subscribers(): RM.Subscriber<Data> {
    return [
      counterModel.increase.onSuccess(this.onIncrease),
      counterModel.reset.onSuccess(this.onIncrease),
      npmInfoModel.reset.onSuccess(this.onIncrease),
      npmInfoModel.manage.onSuccess(this.onIncrease),
    ];
  }

  private onIncrease(state: Data): Data {
    return {
      times: state.times + 1,
      lastTime: (new Date()).toUTCString(),
    };
  }
}

export const summaryModel = new SummaryModel();
