import { PersistModel } from './PersistModel';
import { createReduxStore } from '../../src/core/utils/createReduxStore';

let model: PersistModel;

beforeEach(() => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  model = new PersistModel();

  createReduxStore({
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
      blacklist: [model],
    },
  });
});

afterEach(() => {
  model.clear();
});

test('Restore data from storage', () => {
  expect(model.data.counter).toBe(0);
  model.increase();
  expect(model.data.counter).toBe(1);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(2);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","__persist":{"version":1}}');
});
