import { Effects } from '../../src';
import { TestModel } from '../libs/TestModel';
import { effectModel } from './EffectModel';

interface Data {
  counter: number;
  foo: string;
  bar: string;
}

export class EffectDurationModel extends TestModel<Data> {
  protected effects(): Effects<Data> {
    return [
      effectModel.normalWithDuration.afterSuccess(() => {
        this.changeState((state) => {
          state.counter += 1;
        });
      }, 200),

      effectModel.requestWithDuration.afterPrepare(() => {
        this.changeState((state) => {
          state.counter += 4;
        });
      }, 100),

      effectModel.requestWithDuration.afterSuccess(() => {
        this.changeState((state) => {
          state.counter += 2;
        });
      }, 200),

      effectModel.requestWithDuration.afterFail(() => {
        this.changeState((state) => {
          state.counter += 1;
        });
      }, 200),

      effectModel.composeWithDuration.afterPrepare(() => {
        this.changeState((state) => {
          state.counter += 4;
        });
      }, 100),

      effectModel.composeWithDuration.afterSuccess(() => {
        this.changeState((state) => {
          state.counter += 2;
        });
      }, 200),

      effectModel.composeWithDuration.afterFail(() => {
        this.changeState((state) => {
          state.counter += 1;
        });
      }, 200),
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
