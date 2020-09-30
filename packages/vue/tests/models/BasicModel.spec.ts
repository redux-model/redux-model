import { BasicModel } from './BasicModel';
import { createReduxStore } from '../../src/stores/createReduxStore';
import sleep from 'sleep-promise';

let model: BasicModel;

beforeAll(() => {
  createReduxStore();
});

beforeEach(() => {
  model = new BasicModel(Math.random().toString());
});

test('Model has right initialized reducer data', () => {
  expect(model.data).toEqual({
    id: 1,
    name: 'init-name',
  });
  expect(model.data.age).toBeUndefined();
});

test('Modify data by normal action', () => {
  expect(model.data.id).toBe(1);
  model.modify({ id: 3 });
  expect(model.data.id).toBe(3);

  model.modify({ name: 'cool' });
  expect(model.data.name).toBe('cool');
});

test('Modify data by normal action with after', async () => {
  expect(model.data.id).toBe(1);
  model.modifyWithAfter({ id: 3 });
  expect(model.data.id).toBe(3);

  await sleep(5);
  expect(model.data.id).toBe(6);

  model.modifyWithAfter({ name: 'cool' });
  expect(model.data.name).toBe('cool');

  await sleep(5);
  expect(model.data.id).toBe(7);
});

test('Modify data by normal action with after and duration', async () => {
  expect(model.data.id).toBe(1);
  model.modifyWithAfterAndDuration({ id: 3 });
  expect(model.data.id).toBe(3);

  await sleep(50);
  expect(model.data.id).toBe(3);

  await sleep(51);
  expect(model.data.id).toBe(6);

  model.modifyWithAfterAndDuration({ name: 'cool' });
  expect(model.data.name).toBe('cool');

  await sleep(50);
  expect(model.data.id).toBe(6);

  await sleep(51);
  expect(model.data.id).toBe(7);
});

test('Normal action has successType', () => {
  expect(model.modify.getSuccessType()).toContain(model.constructor.name);
  expect(model.modify.getSuccessType()).toContain('modify');
  expect(model.modify.getSuccessType()).toContain('success');
});

test('Request action has three kind of types', () => {
  expect(model.getProfile.getPrepareType()).toContain(model.constructor.name);
  expect(model.getProfile.getSuccessType()).toContain(model.constructor.name);
  expect(model.getProfile.getFailType()).toContain(model.constructor.name);

  expect(model.getProfile.getPrepareType()).toContain('getProfile');
  expect(model.getProfile.getSuccessType()).toContain('getProfile');
  expect(model.getProfile.getFailType()).toContain('getProfile');

  expect(model.getProfile.getPrepareType()).toContain('prepare');
  expect(model.getProfile.getSuccessType()).toContain('success');
  expect(model.getProfile.getFailType()).toContain('fail');
});

test('Easy to use changeState by non-action method', () => {
  model.modifyByMethod(10002);
  expect(model.data.id).toBe(10002);

  model.modifyByMethod(200);
  expect(model.data.id).toBe(200);

  model.modifyByMethod(230);
  expect(model.data.id).toBe(230);
});

test('Reducer effect can return new object', () => {
  expect(model.data.id).toBe(1);
  model.returnNewObject();
  expect(model.data.id).toBe(100);
  expect(model.data.name).toBe('peter');
});

test('One model can have many instance', () => {
  const modelInner = new BasicModel('my-alias');
  expect(modelInner.modify.getSuccessType()).toContain('my-alias');
});

test('User can get redux data when changing reducer', () => {
  expect(() => model.allowGetData()).not.toThrowError();
});

test('onStoreCreated will invoke on created', async () => {
  await sleep(0);
  expect(model.name).toBe('init-name');
});
