import { createReduxStore } from '@redux-model/core';
import { HookModel } from './HookModel';
import { $api } from '../libs/ApiService';

let model: HookModel;

beforeAll(() => {
  createReduxStore({});
});

beforeEach(() => {
  model = new HookModel();
});

test('Vue allowed to use methods which have prefix useXXX() outside component', () => {
  expect(() => model.useData()).not.toThrowError();
  expect(model.useData().value).toEqual({
    count: 0,
  });
});

test('state effect computed data', () => {
  model.increase();
  expect(model.data.count).toBe(1);

  const doubleCount = model.useData((state) => {
    return state.count * 10;
  });

  expect(doubleCount.value).toBe(10);

  model.increase();
  expect(model.data.count).toBe(2);
  expect(doubleCount.value).toBe(20);
});

test('request action meta', (done) => {
  $api.mockResolveValue({
    count: 15,
  });

  const useLoading = model.fetch.useLoading();
  const useMeta = model.fetch.useMeta();
  const useActionType = model.fetch.useMeta('actionType');

  expect(useLoading.value).toBeFalsy();

  const promise = model.fetch();

  expect(useLoading.value).toBeTruthy();
  expect(useActionType.value).toBe(model.fetch.getPrepareType());
  expect(useMeta.value.actionType).toBe(model.fetch.getPrepareType());

  promise.then(() => {
    expect(useLoading.value).toBeFalsy();
    expect(useActionType.value).toBe(model.fetch.getSuccessType());
    expect(useMeta.value.actionType).toBe(model.fetch.getSuccessType());
    done();
  });
});

test('compose action meta', (done) => {
  $api.mockResolveValue({
    count: 15,
  });
  $api.mockResolveValue({});

  const useLoading = model.mixFetch.useLoading();
  const useMeta = model.mixFetch.useMeta();
  const useActionType = model.mixFetch.useMeta('actionType');

  expect(useLoading.value).toBeFalsy();

  const promise = model.mixFetch(5);

  expect(useLoading.value).toBeTruthy();
  expect(useActionType.value).toBe(model.mixFetch.getPrepareType());
  expect(useMeta.value.actionType).toBe(model.mixFetch.getPrepareType());

  promise.then(() => {
    expect(useLoading.value).toBeFalsy();
    expect(useActionType.value).toBe(model.mixFetch.getSuccessType());
    expect(useMeta.value.actionType).toBe(model.mixFetch.getSuccessType());
    expect(model.data.count).toBe(15);
    done();
  });
});

test('request action metas', (done) => {
  $api.mockResolveValue({
    count: 15,
  });

  const userLoadings = model.multipleFetch.useLoadings(5);
  const useMetas = model.multipleFetch.useMetas(5);

  expect(userLoadings.value).toBeFalsy();

  const promise = model.multipleFetch(5);

  expect(userLoadings.value).toBeTruthy();
  expect(useMetas.value.actionType).toBe(model.multipleFetch.getPrepareType());

  promise.then(() => {
    expect(userLoadings.value).toBeFalsy();
    expect(useMetas.value.actionType).toBe(model.multipleFetch.getSuccessType());
    done();
  });
});
