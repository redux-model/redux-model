import { testModel } from './BasicModel';
import { EffectModel } from './EffectModel';
import { createReduxStore } from '../../src/core/utils/createReduxStore';

let model: EffectModel;

beforeEach(() => {
  model = new EffectModel();
  createReduxStore({
    ...model.register(),
  });
});

test('Effect by normal action', () => {
  expect(model.data.counter).toBe(0);
  testModel.effectOtherModel();
  expect(model.data.counter).toBe(1);
  testModel.effectOtherModel();
  expect(model.data.counter).toBe(2);
  testModel.effectOtherModel();
  expect(model.data.counter).toBe(3);
});

test('Effect data with payload', () => {
  expect(model.data.counter).toBe(0);
  testModel.effectWithPayload({ counter: 130 });
  expect(model.data.counter).toBe(130);

  testModel.effectWithPayload({ counter: 387 });
  expect(model.data.counter).toBe(387);
});
