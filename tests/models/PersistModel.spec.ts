import { createReduxStore } from '../../src/core/utils/store';
import { PersistModel } from './PersistModel';

let model: PersistModel;
let duration = 0;

const sleep = async () => {
  duration += 30;

  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

afterEach(() => {
  model.clear();
});

test('Restore persist data from storage', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');
  model = new PersistModel();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":3}","__metas__":"{}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":4}","__metas__":"{}","__persist":{"version":1}}');
});

test('Clear the persist data when the json data invalid', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":2}}}}}}}');
  model = new PersistModel();

  const spy = jest.spyOn(console, 'error').mockImplementation();
  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 2,
      key: 'test-persist',
      storage: localStorage,
    },
  });
  expect(spy).toHaveBeenCalledTimes(1);

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":2}}');
});

test('Clear the persist data when version is not matched', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');
  model = new PersistModel();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 3,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":3}}');
});

test('No persist data in storage', async () => {
  await sleep();
  localStorage.removeItem('ReduxModel:Persist:test-persist');
  model = new PersistModel();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__persist":{"version":1}}');
});

test('Reducer data is not hint', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"__metas__":"{}","__persist":{"version":1}}');
  model = new PersistModel();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","__persist":{"version":1}}');
  model.increase();
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","PersistModel":"{\\"counter\\":1}","__persist":{"version":1}}');
});

test('Restore data from storage with blacklist', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  model = new PersistModel();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
      blacklist: [model],
    },
  });

  expect(model.data.counter).toBe(0);
  model.increase();
  expect(model.data.counter).toBe(1);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(2);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"__metas__":"{}","__persist":{"version":1}}');
});

test('Restore data from storage with whitelist', async () => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  model = new PersistModel();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
      whitelist: [model],
    },
  });

  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":3}","__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":4}","__persist":{"version":1}}');
});

test('Delay to persist data in production', async (done) => {
  await sleep();
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  const dev = require('../../src/libs/dev');
  const spy = jest.spyOn(dev, 'isDebug').mockImplementation(() => false);

  model = new PersistModel();

  createReduxStore({
    reducers: {
      ...model.register(),
    },
    // @ts-ignore react-native use async storage
    persist: {
      version: 1,
      key: 'test-persist',
      storage: localStorage,
    },
  });

  expect(model.data.counter).toBe(2);
  model.increase();
  expect(model.data.counter).toBe(3);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  setTimeout(() => {
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":4}","__metas__":"{}","__persist":{"version":1}}');
  }, 301);

  model.increase();
  expect(model.data.counter).toBe(4);
  expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":2}","__metas__":"{}","__persist":{"version":1}}');

  setTimeout(() => {
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"PersistModel":"{\\"counter\\":4}","__metas__":"{}","__persist":{"version":1}}');
    done();
  }, 301);

  spy.mockRestore();
});
