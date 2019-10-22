import { Effects } from '../../src/libs';
import { basicModel } from './BasicModel';
import { requestModel } from './RequestModel';
import { BaseTestModel } from './BaseTestModel';

interface Data {
  counter: number;
  foo: string;
  bar: string;
}

export class EffectModel extends BaseTestModel<Data> {
  reset = this.action((state) => {
    state.counter = 0;
  });

  protected effects(): Effects<Data> {
    return [
      basicModel.effectOtherModel.onSuccess((state) => {
        state.counter += 1;
      }),

      basicModel.effectWithPayload.onSuccess((state, action) => {
        state.counter = action.payload.counter;
      }),

      requestModel.getNpmInfo.onPrepare((state) => {
        state.counter += 5;
      }),

      requestModel.getNpmInfo.onSuccess((state) => {
        state.counter += 7;
      }),

      requestModel.getNpmInfo.onFail((state) => {
        state.counter += 10;
      }),
    ];
  }

  protected initReducer(): Data {
    return {
      counter: 0,
      foo: 'foo',
      bar: 'bar',
    };
  }
}

export const effectModel = new EffectModel();
