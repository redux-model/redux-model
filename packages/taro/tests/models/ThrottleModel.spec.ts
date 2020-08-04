import { ThrottleModel } from './ThrottleModel';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { $api } from '../libs/ApiService';
import { $throttleApi } from '../libs/ThrottleService';
import sleep from 'sleep-promise';

let model: ThrottleModel;

beforeAll(() => {
  createReduxStore();
});

beforeEach(() => {
  model = new ThrottleModel(Math.random().toString());
});

test('Throttle action can return remote data without real fetch', async () => {
  $api.mockResolveValue({ id: 123 });
  $api.mockResolveValue({ id: 456 });
  const result1 = await model.enableThrottleProfile('a');
  expect(result1.response.id).toBe(123);

  // From cache
  const result2 = await model.enableThrottleProfile('a');
  expect(result2.response.id).toBe(123);

  // From cache
  const result3 = await model.enableThrottleProfile('a');
  expect(result3.response.id).toBe(123);

  // Not hit
  const result4 = await model.enableThrottleProfile('bb');
  expect(result4.response.id).toBe(456);

  // Cache is expired absolutely
  await sleep(3010);

  $api.mockResolveValue({ id: 987 });
  const result5 = await model.enableThrottleProfile('a');
  expect(result5.response.id).toBe(987);
});

test('Throttle action always fetch remote data if the second parameter set to false', async () => {
  $api.mockResolveValue({ id: 123 });
  const result1 = await model.disableThrottleProfile();
  expect(result1.response.id).toBe(123);

  $api.mockResolveValue({ id: 456 });
  const result2 = await model.disableThrottleProfile();
  expect(result2.response.id).toBe(456);
});

test('Current throttle will be removed when toggle', async () => {
  $api.mockResolveValue({ id: 123 });
  const result1 = await model.configurableThrottle(true);
  expect(result1.response.id).toBe(123);

  $api.mockResolveValue({ id: 456 });
  const result2 = await model.configurableThrottle(false);
  expect(result2.response.id).toBe(456);

  $api.mockResolveValue({ id: 789 });
  const result3 = await model.configurableThrottle(true);
  expect(result3.response.id).toBe(789);
});

test('Clear Throttle action by hand', async () => {
  $api.mockResolveValue({ id: 123 });
  const result1 = await model.enableThrottleProfile('a');
  expect(result1.response.id).toBe(123);

  // Cache
  $api.mockResolveValue({ id: 666 });
  const result2 = await model.enableThrottleProfile('a');
  expect(result2.response.id).toBe(123);

  model.enableThrottleProfile.clearThrottle();

  const result3 = await model.enableThrottleProfile('a');
  expect(result3.response.id).toBe(666);

  // Cache
  const result4 = await model.enableThrottleProfile('a');
  expect(result4.response.id).toBe(666);
});

test('Throttle can adjust the key', async () => {
  $api.mockResolveValue({ id: 123 });
  const query = { name: 'abcd' };
  await model.withTransfer(query);

  const result = await model.withTransfer(query);
  expect(result.response.id).toBe(123);
  expect(query.name).toBe('abcd');
});

test('Throttle can adjust the key by global transer', async () => {
  $throttleApi.mockResolveValue({ id: 123 });
  const query = { name: 'abcd' };
  await model.withGlobalTransfer(query);

  const result = await model.withGlobalTransfer(query);
  expect(result.response.id).toBe(123);
  expect(query.name).toBe('abcd');
  expect(query).toHaveProperty('__rand');
});
