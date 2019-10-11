import { Effects, Model } from '../../src/web';
import { testModel } from './BasicModel';

interface Data {
  counter: number;
  foo: string;
  bar: string;
}

export class EffectModel extends Model<Data> {
  protected effects(): Effects<Data> {
    return [
      testModel.effectOtherModel.onSuccess((state) => {
        state.counter += 1;
      }),

      testModel.effectWithPayload.onSuccess((state, action) => {
        state.counter = action.payload.counter;
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
