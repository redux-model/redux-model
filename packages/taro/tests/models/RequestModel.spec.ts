import { $api } from '../libs/ApiService';
import { RequestModel } from './RequestModel';
import { METHOD } from '@redux-model/core';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { IResponseAction } from '@redux-model/core';
import sleep from 'sleep-promise';

const data = {
  id: 1463,
  name: 'Join',
  age: 30,
};

let model: RequestModel;

beforeAll(() => {
  createReduxStore();
});

beforeEach(() => {
  model = new RequestModel(Math.random().toString());
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

  // @ts-expect-error
  expect(model.getProfileById.loading).toBeUndefined();
  // @ts-expect-error
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

// FIXME:
// test('Request not found', async () => {
//   try {
//     await model.getNpmInfo((new Date()).toUTCString());
//   } catch (e) {
//     expect(e.type).toBe(model.getNpmInfo.getFailType());
//     expect(e.message).toBe('Not found');
//     expect(e.httpStatus).toBe(404);
//   }
// });

// test('Request timeout', async () => {
//   try {
//     await model.getNpmInfoWithTimeout('redux');

//     expect(false).toBeTruthy();
//   } catch (e) {
//     expect(e.message).toBe('Timeout!');
//   }
// });

// test('Easy to abort request action', (done) => {
//   const promise = model.getNpmInfo('redux');

//   promise
//     .catch((e: IResponseAction) => {
//       expect(e.type).toBe(model.getNpmInfo.getFailType());
//       expect(e.message).toBe('Abort');

//       const promise = model.getNpmInfo('react-redux');
//       promise
//         .catch((e: IResponseAction) => {
//           expect(e.type).toBe(model.getNpmInfo.getFailType());

//           done();
//         });

//       promise.cancel();
//     });

//   promise.cancel();
// });

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
    .catch((e: IResponseAction) => {
      expect(e.payload).toStrictEqual({
        who: 'boom',
      });
      done();
    });
});

describe('Request action can handle afterXXX', () => {
  beforeEach(() => {
    model = new RequestModel(Math.random().toString());
  });

  test('case prepare', async (done) => {
    $api.mockResolveValue({ count: 123 }, 20);
    expect(model.data.id).toBe(1);

    model.withAfterXXX().then(() => done());
    expect(model.data.id).toBe(1);
    await sleep(10); // Before success
    expect(model.data.id).toBe(2);
  });

  test('case success', async () => {
    $api.mockResolveValue({ count: 123 }, 20);
    expect(model.data.id).toBe(1);

    await model.withAfterXXX();
    expect(model.data.id).toBe(2);
    await sleep(10);
    expect(model.data.id).toBe(125);
  });

  test('case fail', async () => {
    $api.mockRejectValue({ count: 123 }, 20);
    expect(model.data.id).toBe(1);

    try {
      await model.withAfterXXX();
    } catch {}
    expect(model.data.id).toBe(2);
    await sleep(10);
    expect(model.data.id).toBe(4);
  });
});

describe('Request action can handle afterXXX with duration', () => {
  beforeEach(() => {
    model = new RequestModel(Math.random().toString());
  });

  test('case prepare', async () => {
    $api.mockResolveValue({ count: 123 });
    expect(model.data.id).toBe(1);

    model.withAfterXXXAndDuration();
    await sleep(20);
    expect(model.data.id).toBe(1);
    await sleep(100);
    expect(model.data.id).toBe(2);
  });

  test('case success', async () => {
    $api.mockResolveValue({ count: 123 });
    expect(model.data.id).toBe(1);

    await model.withAfterXXXAndDuration();
    await sleep(20);
    expect(model.data.id).toBe(1);
    await sleep(250);
    expect(model.data.id).toBe(125);
  });

  test('case fail', async () => {
    $api.mockRejectValue({ count: 123 });
    expect(model.data.id).toBe(1);

    try {
      await model.withAfterXXXAndDuration();
    } catch {}
    await sleep(20);
    expect(model.data.id).toBe(1);
    await sleep(250);
    expect(model.data.id).toBe(4);
  });
});
