import { Model, Effects } from '../../src';
import { effectModel } from './EffectModel';

interface Data {
  counter: number;
  foo: string;
  bar: string;
}

export class EffectDurationModel extends Model<Data> {
  protected effects(): Effects<Data> {
    return [
      effectModel.normalWithDuration.afterSuccess(() => {
        this.changeReducer((state) => {
          state.counter += 1;
        });
      }, 200),

      effectModel.requestWithDuration.afterPrepare(() => {
        this.changeReducer((state) => {
          state.counter += 4;
        });
      }, 100),

      effectModel.requestWithDuration.afterSuccess(() => {
        this.changeReducer((state) => {
          state.counter += 2;
        });
      }, 200),

      effectModel.requestWithDuration.afterFail(() => {
        this.changeReducer((state) => {
          state.counter += 1;
        });
      }, 200),

      effectModel.composeWithDuration.afterPrepare(() => {
        this.changeReducer((state) => {
          state.counter += 4;
        });
      }, 100),

      effectModel.composeWithDuration.afterSuccess(() => {
        this.changeReducer((state) => {
          state.counter += 2;
        });
      }, 200),

      effectModel.composeWithDuration.afterFail(() => {
        this.changeReducer((state) => {
          state.counter += 1;
        });
      }, 200),
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
