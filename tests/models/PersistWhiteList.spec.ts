import { PersistModel } from './PersistModel';
import { createReduxStore } from '../../src/core/utils/store';

let model: PersistModel;

beforeEach(() => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  model = new PersistModel();

  createReduxStore({
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
      whitelist: [model],
    },
  });
});

afterEach(() => {
  model.clear();
});

test('Restore data from storage', () => {
  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":3}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":4}","__persist":{"version":1}}');
});
