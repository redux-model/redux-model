import { effectModel } from './EffectModel';
import { $api } from '../libs/ApiService';
import { createReduxStore } from '../../src';
import sleep from 'sleep-promise';
import { EffectDurationModel } from './EffectDurationModel';

let model: EffectDurationModel;

beforeEach(() => {
  model = new EffectDurationModel(Math.random().toString());
  createReduxStore();
});

describe('Effect data by action afterXXXX with duration', () => {
  beforeEach(() => {
    model = new EffectDurationModel(Math.random().toString());
  });

  test('case normal afterSuccess', async () => {
    effectModel.normalWithDuration();
    effectModel.normalWithDuration();
    expect(model.data.counter).toBe(0);

    const RUN_ACTION_TIMES = 2;

    await sleep(50);
    expect(model.data.counter).toBe(0);
    await sleep(200);
    expect(model.data.counter).toBe(RUN_ACTION_TIMES);
  });

  test('case request afterPrepare', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({});
    effectModel.requestWithDuration();

    await sleep(50);
    expect(model.data.counter).toBe(0);
    await sleep(100);
    expect(model.data.counter).toBe(4);
  });

  test('case request afterSuccess', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({});
    await effectModel.requestWithDuration();
    await sleep(50);
    expect(model.data.counter).toBe(0);
    await sleep(200);
    expect(model.data.counter).toBe(6);

    $api.mockResolveValue();
    await effectModel.requestWithDuration();
    await sleep(50);
    expect(model.data.counter).toBe(6);
    await sleep(200);
    expect(model.data.counter).toBe(12);
  });

  test('case request afterFail', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockRejectValue({});
    try {
      await effectModel.requestWithDuration();
    } catch {}
    await sleep(50);
    expect(model.data.counter).toBe(0);
    await sleep(200);
    expect(model.data.counter).toBe(5);

    $api.mockRejectValue();
    try {
      await effectModel.requestWithDuration();
    } catch {}
    await sleep(50);
    expect(model.data.counter).toBe(5);
    await sleep(200);
    expect(model.data.counter).toBe(10);
  });

  test('case compose afterPrepare', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({});
    effectModel.composeWithDuration();

    await sleep(50);
    expect(model.data.counter).toBe(0);
    await sleep(100);
    expect(model.data.counter).toBe(4);
  });

  test('case compose afterSuccess', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockResolveValue({});
    await effectModel.composeWithDuration();
    await sleep(50);
    expect(model.data.counter).toBe(0);
    await sleep(200);
    expect(model.data.counter).toBe(6);

    $api.mockResolveValue({});
    await effectModel.composeWithDuration();
    await sleep(50);
    expect(model.data.counter).toBe(6);
    await sleep(200);
    expect(model.data.counter).toBe(12);
  });

  test('case compose afterFail', async () => {
    expect(model.data.counter).toBe(0);

    $api.mockRejectValue({});
    try {
      await effectModel.composeWithDuration();
    } catch {}
    await sleep(50);
    expect(model.data.counter).toBe(0);
    await sleep(200);
    expect(model.data.counter).toBe(5);

    $api.mockRejectValue();
    try {
      await effectModel.composeWithDuration();
    } catch {}
    await sleep(50);
    expect(model.data.counter).toBe(5);
    await sleep(200);
    expect(model.data.counter).toBe(10);
  });
});
