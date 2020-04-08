import { PersistAutoModel } from './PersistAutoModel';
import { createReduxStore } from '../../src/core/utils/store';

test('Initial data will be used if persist data is missing', () => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"__metas__":"{}","__persist":{"version":1}}');

  createReduxStore({
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      // @ts-ignore react-native use async storage
      storage: localStorage,
    },
  });

  const model = new PersistAutoModel();

  expect(model.data.counter).toBe(0);
  model.increase();
  expect(model.data.counter).toBe(1);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(2);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
});
