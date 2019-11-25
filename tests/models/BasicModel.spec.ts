import { BasicModel } from './BasicModel';
import { createReduxStore } from '../../src/core/utils/store';

let model: BasicModel;
let spy: jest.SpyInstance | undefined;

beforeAll(() => {
  createReduxStore({});
});

afterAll(() => {
  spy?.mockRestore();
});

beforeEach(() => {
  model = new BasicModel();
});

afterEach(() => {
  model.clear();
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

test('Easy to use changeReducer by non-action method', () => {
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

test('Even if it can be register automatically, but we can register model again and again', () => {
  expect(model.data.id).toBe(1);
  model.modify({
    id: 44,
  });
  expect(model.data.id).toBe(44);

  // Must restore when all tests is finished in this file.
  // Or console.warn can't be prevented.
  spy = jest.spyOn(console, 'warn').mockImplementation();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
  });
  expect(model.data.id).toBe(44);

  createReduxStore({
    reducers: {
      ...model.register(),
    },
  });
  expect(model.data.id).toBe(44);
  expect(spy).toHaveBeenCalledTimes(2);
});

test('Not allowed to use methods which have prefix useXXX() outside hooks-style component', () => {
  expect(() => model.useData()).toThrowError();
});

test('User can get redux data when changing reducer', () => {
  expect(() => model.allowGetData()).not.toThrowError();
});
