import { $api } from './ApiService';
import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { RequestModel } from './RequestModel';
import { ReducerAction } from '../../src/core/utils/types';
import { METHOD } from '../../src/core/utils/method';

const data = {
  id: 1463,
  name: 'Join',
  age: 30,
};

let model: RequestModel;

beforeAll(() => {
  createReduxStore({});
});

beforeEach(() => {
  model = new RequestModel();
});

afterEach(() => {
  model.clear();
});

test('Profile can be fetch by request action', async () => {
  $api.mockResolveValue(data);

  const profile = await model.getProfile();

  expect(profile.response).toBe(data);
  expect(model.data).toStrictEqual({
    ...data,
    records: model.data.records,
  });
});

test('Request action has the correct meta', (done) => {
  $api.mockResolveValue();

  const promise = model.getProfile();

  expect(model.getProfile.loading).toBeTruthy();
  expect(model.getProfile.meta.actionType).toBe(model.getProfile.getPrepareType());

  promise.then((profile) => {
    expect(profile.type).toBe(model.getProfile.getSuccessType());
    expect(model.getProfile.meta.actionType).toBe(model.getProfile.getSuccessType());
    expect(model.getProfile.loading).toBeFalsy();

    done();
  });
});

test('Request action has the correct metas', (done) => {
  $api.mockResolveValue(data);

  const promise = model.getProfileById(data.id);

  expect(model.getProfileById.loadings.pick(data.id)).toBeTruthy();
  expect(model.getProfileById.metas.pick(data.id).actionType).toBe(model.getProfileById.getPrepareType());

  expect(model.getProfileById.loading).toBeUndefined();
  expect(model.getProfileById.meta.loading).toBeUndefined();

  expect(model.data.records[data.id]).toBeUndefined();

  promise.then((profile) => {
    expect(profile.type).toBe(model.getProfileById.getSuccessType());
    expect(model.getProfileById.metas.pick(data.id).actionType).toBe(model.getProfileById.getSuccessType());
    expect(model.getProfileById.loadings.pick(data.id)).toBeFalsy();

    expect(profile.response).toBe(data);
    expect(model.data.records[data.id]).toStrictEqual(data);

    done();
  });
});

test('Fetch profile by orphan request', async () => {
  $api.mockResolveValue(data);

  const profile = await model.orphanGetRequest();

  expect(profile.id).toBe(data.id);
});

test('Request not found', async () => {
  try {
    await model.getNpmInfo((new Date()).toUTCString());
  } catch (e) {
    expect(e.type).toBe(model.getNpmInfo.getFailType());
    expect(e.message).toBe('Not found');
    expect(e.httpStatus).toBe(404);
  }
});

test('Request timeout', async () => {
  try {
    await model.getNpmInfoWithTimeout('redux');

    expect(false).toBeTruthy();
  } catch (e) {
    expect(e.message).toBe('Timeout!');
  }
});

test('Easy to abort request action', (done) => {
  const promise = model.getNpmInfo('redux');

  promise
    .catch((e: ReducerAction) => {
      expect(e.type).toBe(model.getNpmInfo.getFailType());
      expect(e.message).toBe('Abort');

      const promise = model.getNpmInfo('react-redux');
      promise
        .catch((e: ReducerAction) => {
          expect(e.type).toBe(model.getNpmInfo.getFailType());
          expect(e.message).toBe('I want to cancel by myself');

          done();
        });
      promise.cancel('I want to cancel by myself');
    });

  promise.cancel();
});

describe('Request action has three kinds of reducer event', () => {
  test('case onPrepare', () => {
    $api.mockResolveValue();
    model.getProfile();
    expect(model.data.id).toBe(666);
  });

  test('case onSuccess', async () => {
    $api.mockResolveValue(data);
    await model.getProfile();
    expect(model.data.id).toBe(data.id);
  });

  test('case onFail', async () => {
    $api.mockRejectValue();
    try {
      await model.getProfile();
      expect(false).toBeTruthy();
    } catch {
      expect(model.data.id).toBe(1000);
    }
  });
});

test('Request Action has correct method', async () => {
  $api.mockResolveValue();
  const result1 = await model.getProfile();
  expect(result1).toHaveProperty('method', METHOD.get);

  $api.mockResolveValue();
  const result2 = await model.withPostProfile();
  expect(result2).toHaveProperty('method', METHOD.post);

  $api.mockResolveValue();
  const result3 = await model.withPutProfile();
  expect(result3).toHaveProperty('method', METHOD.put);

  $api.mockResolveValue();
  const result4 = await model.withDeleteProfile();
  expect(result4).toHaveProperty('method', METHOD.delete);
});

test('Request Action has correct payload', async (done) => {
  $api.mockResolveValue();
  const result1 = await model.payloadRequest('jack');
  expect(result1.payload).toStrictEqual({
    who: 'jack',
  });

  $api.mockResolveValue();
  const result2 = await model.payloadRequest('peter');
  expect(result2.payload).toStrictEqual({
    who: 'peter',
  });

  $api.mockRejectValue();
  model.payloadRequest('boom')
    .catch((e: ReducerAction) => {
      expect(e.payload).toStrictEqual({
        who: 'boom',
      });
      done();
    });
});

test('Cache action can return remote data without real fetch', async () => {
  $api.mockResolveValue({ id: 123 });
  const result1 = await model.enableCacheProfile();
  expect(result1.response.id).toBe(123);

  // From cache
  const result2 = await model.enableCacheProfile();
  expect(result2.response.id).toBe(123);

  // From cache
  const result3 = await model.enableCacheProfile();
  expect(result3.response.id).toBe(123);

  // Cache is expired absolutely
  await new Promise((resolve) => {
    setTimeout(resolve, 3010);
  });

  $api.mockResolveValue({ id: 987 });
  const result4 = await model.enableCacheProfile();
  expect(result4.response.id).toBe(987);
});

test('Cache action always fetch remote data if the second parameter set to false', async () => {
  $api.mockResolveValue({ id: 123 });
  const result1 = await model.disableCacheProfile();
  expect(result1.response.id).toBe(123);

  $api.mockResolveValue({ id: 456 });
  const result2 = await model.disableCacheProfile();
  expect(result2.response.id).toBe(456);
});
