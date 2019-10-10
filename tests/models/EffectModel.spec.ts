import { testModel } from './TestModel';
import { EffectModel } from './EffectModel';
import { createReduxStore } from '../../src/core/utils/createReduxStore';

beforeAll(() => {
  createReduxStore({});
});

let effectModel: EffectModel;

beforeEach(() => {
  effectModel = new EffectModel();
});

test('Effect by normal action', () => {
  expect(effectModel.data.counter).toBe(0);
  testModel.effectOtherModel();
  expect(effectModel.data.counter).toBe(1);
  testModel.effectOtherModel();
  expect(effectModel.data.counter).toBe(2);
  testModel.effectOtherModel();
  expect(effectModel.data.counter).toBe(3);
});

test('Effect data with payload', () => {
  expect(effectModel.data.counter).toBe(0);
  testModel.effectWithPayload({ counter: 130 });
  expect(effectModel.data.counter).toBe(130);

  testModel.effectWithPayload({ counter: 387 });
  expect(effectModel.data.counter).toBe(387);
});
