import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { ManualRegisterModel } from './ManualRegisterModel';

let model: ManualRegisterModel;

beforeEach(() => {
  createReduxStore({});
});

beforeEach(() => {
  model = new ManualRegisterModel();
});

afterEach(() => {
  model.clear();
});

test('No reducer data when we forget register', () => {
  expect(() => model.data.foo).toThrowError();
});

test('Not allowed to modify reducer when we forget register', () => {
  model.modify();
  expect(() => model.data.foo).toThrowError();
});

test('Null point register is useless', () => {
  model.register();
  expect(() => model.data.foo).toThrowError();
});

test('Reducer data can be found after register model to store', () => {
  createReduxStore({
    reducers: {
      ...model.register(),
    },
  });
  expect(model.data.foo).toBe('foo');

  model.modify();
  expect(model.data.foo).toBe('bar');

  createReduxStore({
    reducers: {
      ...model.register(),
    },
  });
  expect(model.data.foo).toBe('bar');
});

test('Not allowed to change reducer before register', () => {
  expect(() => model.testChangeReducer('')).toThrowError();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
  });
  expect(model.data.foo).toBe('foo');

  expect(() => model.testChangeReducer('new-bar')).not.toThrowError();
  expect(model.data.foo).toBe('new-bar');

  model.testChangeReducer('new-foo');
  expect(model.data.foo).toBe('new-foo');
});
