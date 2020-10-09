import { TestModel } from '../libs/TestModel';
import { Effects } from '../../src';
import { basicModel } from './BasicModel';
import { requestModel } from './RequestModel';
import { composeModel } from './ComposeModel';
import { $api } from '../libs/ApiService';

interface Data {
  counter: number;
  foo: string;
  bar: string;
}

export class EffectModel extends TestModel<Data> {
  reset = this.action((state) => {
    state.counter = 0;
  });

  normalWithDuration = this.action(() => {});

  requestWithDuration = $api.action(() => this.patch('/'));

  composeWithDuration = this.compose(async () => {
    await $api.getAsync({
      uri: '/api',
    });
  });

  protected effects(): Effects<Data> {
    return [
      basicModel.effectOtherModel.onSuccess((state) => {
        state.counter += 1;
      }),

      basicModel.effectOtherModel.afterSuccess(() => {
        this.changeState((state) => {
          state.counter += 1;
        });
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

      requestModel.getProfile.afterPrepare(() => {
        this.changeState((state) => {
          state.counter += 4;
        });
      }),

      requestModel.getProfile.afterSuccess(() => {
        this.changeState((state) => {
          state.counter += 2;
        });
      }),

      requestModel.getProfile.afterFail(() => {
        this.changeState((state) => {
          state.counter += 1;
        });
      }),

      composeModel.manage.afterPrepare(() => {
        this.changeState((state) => {
          state.counter += 4;
        });
      }),

      composeModel.manage.afterSuccess(() => {
        this.changeState((state) => {
          state.counter += 2;
        });
      }),

      composeModel.manage.afterFail(() => {
        this.changeState((state) => {
          state.counter += 1;
        });
      }),
    ];
  }

  protected initialState(): Data {
    return {
      counter: 0,
      foo: 'foo',
      bar: 'bar',
    };
  }
}

export const effectModel = new EffectModel();
