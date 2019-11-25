import { createReduxStore } from '../../src/core/utils/store';
import { NoImmerModel } from './NoImmerModel';
import { isDraftable } from 'immer';

let model: NoImmerModel;

beforeEach(() => {
  createReduxStore({});
});

beforeEach(() => {
  model = new NoImmerModel();
});

afterEach(() => {
  model.clear();
});

test('For basic data type, we can not modify state', () => {
  expect(model.data).toBe('foo');
  model.changeData();
  expect(model.data).toBe('bar');
  expect(model.lastState).toBe('foo');
  expect(isDraftable(model.lastState)).toBeFalsy();
});

test('New data is required if immer is gone', () => {
  expect(() => model.dontReturnValue()).toThrowError(TypeError);
});
