import { testModel } from './BasicModel';
import { EffectModel } from './EffectModel';
import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { $api } from './ApiService';
import { requestModel } from './RequestModel';

let model: EffectModel;

beforeEach(() => {
  model = new EffectModel();
  createReduxStore({
    ...model.register(),
  });
});

afterEach(() => {
  model.reset();
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

describe('Effect data by request action', () => {
  test('case success', (done) => {
    const counter = model.data.counter;

    expect(counter).toBe(0);
    $api.mockResolveValue();

    const promise = requestModel.getNpmInfo('redux');

    expect(model.data.counter).toBe(counter + 5);
    promise.then(() => {
      expect(model.data.counter).toBe(counter + 5 + 7);
      done();
    });
  });

  test('case fail', (done) => {
    const counter = model.data.counter;

    expect(counter).toBe(0);
    $api.mockRejectValue();

    const promise = requestModel.getNpmInfo('redux');

    expect(model.data.counter).toBe(counter + 5);
    promise
      .catch(() => {
      expect(model.data.counter).toBe(counter + 5 + 10);
      done();
    });
  });
});
