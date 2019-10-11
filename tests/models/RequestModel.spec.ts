import { $api } from './ApiService';
import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { RequestModel } from './RequestModel';

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

test('Profile can be fetch by request action', async () => {
  $api.mockValue(data);

  const profile = await model.getProfile();

  expect(profile.response).toBe(data);
  expect(model.data).toStrictEqual({
    ...data,
    records: model.data.records,
  });
});

test('Request action has the correct meta', (done) => {
  $api.mockValue();

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
  $api.mockValue(data);

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
    expect(model.data.records[data.id]).toBe(data);

    done();
  });
});

test('Fetch profile by orphan request', async () => {
  const profile = await model.orphanGetRequest();

  expect(profile.id).toBe(data.id);
});
