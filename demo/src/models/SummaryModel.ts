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

  protected onIncrease(state: Data): Data {
    return {
      times: state.times + 1,
      lastTime: (new Date()).toUTCString(),
    };
  }

  protected getEffects(): RM.Effects<Data> {
    return [
      {
        when: counterModel.increase.getSuccessType(),
        effect: this.onIncrease,
      },
      {
        when: counterModel.reset.getSuccessType(),
        effect: this.onIncrease,
      },
      {
        when: npmInfoModel.manage.getPrepareType(),
        effect: this.onIncrease,
      },
      {
        when: npmInfoModel.reset.getSuccessType(),
        effect: this.onIncrease,
      },
    ];
  }
}

export const summaryModel = new SummaryModel();
