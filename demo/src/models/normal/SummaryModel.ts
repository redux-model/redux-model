import { ReducerModel } from '../../../../src';
import { counterModel } from './CounterModel';
import { resetModel } from './ResetModel';
import { npmInfoModel } from '../request/NpmInfoModel';
import { resetNpmInfoModel } from '../request/ResetNpmInfoModel';

interface Data {
  times: number;
  lastTime?: string;
}

class SummaryModel extends ReducerModel<Data> {
  protected getInitValue(): Data {
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

  protected getEffects(): RM.ReducerEffects<Data> {
    return [
      {
        when: counterModel.getSuccessType(),
        effect: this.onIncrease,
      },
      {
        when: resetModel.getSuccessType(),
        effect: this.onIncrease,
      },
      {
        when: npmInfoModel.getPrepareType(),
        effect: this.onIncrease,
      },
      {
        when: resetNpmInfoModel.getSuccessType(),
        effect: this.onIncrease,
      },
    ];
  }
}

export const summaryModel = new SummaryModel();
