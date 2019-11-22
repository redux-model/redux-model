import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { PersistModel } from './PersistModel';

let model: PersistModel;

beforeEach(() => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });
});

beforeEach(() => {
  model = new PersistModel();
});

afterEach(() => {
  model.clear();
});

test('Restore persist data from storage', () => {
  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":3}","__metas__":"{}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":4}","__metas__":"{}","__persist":{"version":1}}');
});

test('Clear the persist data when the json data invalid', () => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}}}}}}');

  const spy = jest.spyOn(console, 'error').mockImplementation();
  createReduxStore({
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });
  expect(spy).toHaveBeenCalledTimes(1);

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
});

test('Clear the persist data when version is not matched', () => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 2,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":2}}');
});

test('No persist data in storage', () => {
  localStorage.removeItem('ReduxModel:Persist:test-persist');

  createReduxStore({
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
});

test('Reducer data is not hint', () => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"__metas__":"{}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  // Recreate model to cover a condition in `switchInitData()`
  model = new PersistModel();

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","__persist":{"version":1}}');
  model.increase();
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","PersistModel":"{\\"counter\\":1}","__persist":{"version":1}}');
});
