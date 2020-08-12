import { ManualRegisterModel } from './ManualRegisterModel';
import { createReduxStore } from '../../src/stores/createReduxStore';

let model: ManualRegisterModel;

beforeEach(() => {
  createReduxStore();
});

beforeEach(() => {
  model = new ManualRegisterModel(Math.random().toString());
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
  expect(() => model.testChangeState('')).toThrowError();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
  });
  expect(model.data.foo).toBe('foo');

  expect(() => model.testChangeState('new-bar')).not.toThrowError();
  expect(model.data.foo).toBe('new-bar');

  model.testChangeState('new-foo');
  expect(model.data.foo).toBe('new-foo');
});
