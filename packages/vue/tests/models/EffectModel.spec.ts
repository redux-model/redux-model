import { basicModel } from './BasicModel';
import { EffectModel } from './EffectModel';
import { $api } from '../libs/ApiService';
import { createReduxStore } from '../../src';
import { requestModel } from './RequestModel';
import sleep from 'sleep-promise';
import { composeModel } from './ComposeModel';

let model: EffectModel;

beforeEach(() => {
  model = new EffectModel(Math.random().toString());
  createReduxStore({
  });
});

test('Effect by normal action', () => {
  expect(model.data.counter).toBe(0);
  basicModel.effectOtherModel();
  expect(model.data.counter).toBe(1);
  basicModel.effectOtherModel();
  expect(model.data.counter).toBe(2);
  basicModel.effectOtherModel();
  expect(model.data.counter).toBe(3);
});

test('Effect data with payload', () => {
  expect(model.data.counter).toBe(0);
  basicModel.effectWithPayload({ counter: 130 });
  expect(model.data.counter).toBe(130);

  basicModel.effectWithPayload({ counter: 387 });
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

describe('Effect data by action afterXXXX', () => {
  beforeEach(() => {
    model = new EffectModel(Math.random().toString());
  });

  test('case normal afterSuccess', async () => {
    basicModel.effectOtherModel();
    basicModel.effectOtherModel();
    expect(model.data.counter).toBe(2);

    const RUN_ACTION_TIMES = 2;

    await sleep(10);
    expect(model.data.counter).toBe(2 + RUN_ACTION_TIMES);
  });

  test('case request afterPrepare', async (done) => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({}, 30);
    requestModel.getProfile().then(() => done());

    expect(model.data.counter).toBe(0);
    await sleep(10); // Before success
    expect(model.data.counter).toBe(4);
  });

  test('case request afterSuccess', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({}, 20);
    await requestModel.getProfile();
    await sleep(10);
    expect(model.data.counter).toBe(6);

    $api.mockResolveValue();
    await requestModel.getProfile();
    await sleep(10);
    expect(model.data.counter).toBe(12);
  });

  test('case request afterFail', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockRejectValue({}, 20);
    try {
      await requestModel.getProfile();
    } catch {}
    await sleep(10);
    expect(model.data.counter).toBe(5);

    $api.mockRejectValue();
    try {
      await requestModel.getProfile();
    } catch {}
    expect(model.data.counter).toBe(5);
    await sleep(10);
    expect(model.data.counter).toBe(10);
  });

  test('case compose afterPrepare', async (done) => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({}, 30);
    $api.mockResolveValue({}, 30);
    composeModel.manage().then(() => done());

    expect(model.data.counter).toBe(0);
    await sleep(10); // Before success
    expect(model.data.counter).toBe(4);
  });

  test('case compose afterSuccess', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({}, 20);
    $api.mockResolveValue({}, 20);
    await composeModel.manage();
    await sleep(10);
    expect(model.data.counter).toBe(6);

    $api.mockResolveValue({});
    $api.mockResolveValue({});
    await composeModel.manage();
    await sleep(10);
    expect(model.data.counter).toBe(12);
  });

  test('case compose afterFail', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockRejectValue({}, 20);
    $api.mockRejectValue({}, 20);
    try {
      await composeModel.manage();
    } catch {}
    await sleep(10);
    expect(model.data.counter).toBe(5);

    $api.mockRejectValue();
    $api.mockRejectValue();
    try {
      await composeModel.manage();
    } catch {}
    await sleep(10);
    expect(model.data.counter).toBe(10);
  });
});
