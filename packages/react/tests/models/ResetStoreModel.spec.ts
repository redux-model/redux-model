import { createReduxStore, Model } from '../../src';
import { KeepStoreModel, ResetStoreModel } from './ResetStoreModel';

beforeAll(() => {
  createReduxStore();
});

test('Reset store', () => {
  const model = new ResetStoreModel(Math.random().toString());

  expect(model.data.counter).toBe(0);
  model.plus();
  expect(model.data.counter).toBe(1);
  Model.resetStore();
  expect(model.data.counter).toBe(0);
});

test('Keep state when reset store', () => {
  const model = new KeepStoreModel(Math.random().toString());

  expect(model.data.counter).toBe(0);
  model.plus();
  expect(model.data.counter).toBe(1);
  Model.resetStore();
  expect(model.data.counter).toBe(1);
});
