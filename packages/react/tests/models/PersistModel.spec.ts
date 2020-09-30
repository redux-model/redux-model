import sleep from 'sleep-promise';
import { PersistModel } from './PersistModel';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { storeHelper } from '@redux-model/core';

let model: PersistModel;
let persistKey: string;

beforeEach(() => {
  persistKey = Math.random().toString();
  model = new PersistModel(Math.random().toString());
});

describe('Persist bootstrap by async', () => {
  test('localstorage', async() => {
    createReduxStore({
      persist: {
        version: 1,
        key: persistKey,
        storage: 'local',
        allowlist: {},
      },
    });

    expect(storeHelper.persist.isReady()).toBeFalsy();

    await sleep(10);
    expect(storeHelper.persist.isReady()).toBeTruthy();
  });

  test('sessionStorage', async() => {
    createReduxStore({
      persist: {
        version: 1,
        key: persistKey,
        storage: 'session',
        allowlist: {},
      },
    });

    expect(storeHelper.persist.isReady()).toBeFalsy();

    await sleep(10);
    expect(storeHelper.persist.isReady()).toBeTruthy();
  });

  test('memoryStorage', async() => {
    createReduxStore({
      persist: {
        version: 1,
        key: persistKey,
        storage: 'memory',
        allowlist: {},
      },
    });

    expect(storeHelper.persist.isReady()).toBeFalsy();

    await sleep(10);
    expect(storeHelper.persist.isReady()).toBeTruthy();
  });
});

test('Restore persist data from storage', async () => {
  localStorage.setItem(`ReduxModel:Persist:${persistKey}`, '{"model":"{\\"counter\\":20}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 1,
      key: persistKey,
      storage: 'local',
      allowlist: {
        model,
      },
    },
  });
  storeHelper.persist.subscribe(model.getReducerName());

  expect(model.data.counter).toBe(0);

  await sleep(10);

  expect(model.data.counter).toBe(20);
  model.increase();
  expect(model.data.counter).toBe(21);

  await sleep(10);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toContain('"model":"{\\"counter\\":21}"');

  model.increase();
  expect(model.data.counter).toBe(22);

  await sleep(10);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toContain('"model":"{\\"counter\\":22}"');
});

test('Clear the persist data when the json data invalid', async () => {
  localStorage.setItem(`ReduxModel:Persist:${persistKey}`, '{}}}}}}}');

  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  createReduxStore({
    persist: {
      version: 2,
      key: persistKey,
      storage: 'local',
      allowlist: {
        model,
      },
    },
  });

  await sleep(10);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toBe('{"__persist":{"version":2}}');

  spy.mockRestore();
});

test('Clear the persist data when version is not matched', async () => {
  localStorage.setItem(`ReduxModel:Persist:${persistKey}`, '{"model":"{\\"counter\\":2}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 3,
      key: persistKey,
      storage: 'local',
      allowlist: {
        model,
      },
    },
  });

  await sleep(10);
  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toBe('{"__persist":{"version":3}}');
});

test('No persist data in storage', async () => {
  createReduxStore({
    persist: {
      version: 10,
      key: persistKey,
      storage: 'local',
      allowlist: {
        model,
      },
    },
  });

  await sleep(10);
  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toBe('{"__persist":{"version":10}}');
});

test('Reducer data is not hit', async () => {
  localStorage.setItem(`ReduxModel:Persist:${persistKey}`, '{"__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 1,
      key: persistKey,
      storage: 'local',
      allowlist: {
        model,
      },
    },
  });

  await sleep(10);
  expect(model.data.counter).toBe(0);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toBe('{"__persist":{"version":1}}');
  model.increase();
  await sleep(10);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toContain('"model":"{\\"counter\\":1}"');
});

test('Restore data from storage without whitelist', async () => {
  localStorage.setItem(`ReduxModel:Persist:${persistKey}`, '{"model":"{\\"counter\\":2}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 1,
      key: persistKey,
      storage: 'local',
      allowlist: {},
    },
  });

  await sleep(10);
  expect(model.data.counter).toBe(0);
  model.increase();
  expect(model.data.counter).toBe(1);
  await sleep(10);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toBe('{"__persist":{"version":1}}');
  model.increase();
  expect(model.data.counter).toBe(2);
  await sleep(10);
  expect(localStorage.getItem(`ReduxModel:Persist:${persistKey}`)).toBe('{"__persist":{"version":1}}');
});

test('Persit will use cache data for re-create store', (done) => {
  localStorage.setItem(`ReduxModel:Persist:${persistKey}`, `{"model":"{\\"counter\\":2}","__persist":{"version":1}}`);

  createReduxStore({
    persist: {
      version: 1,
      key: persistKey,
      storage: 'local',
      allowlist: {
        model,
      },
    },
  });
  storeHelper.persist.subscribe(model.getReducerName());

  storeHelper.persist.listenOnce(async () => {
    const model2 = new PersistModel(Math.random().toString());

    localStorage.setItem(`ReduxModel:Persist:${persistKey}`, `{"model2":"{\\"counter\\":2000}","__persist":{"version":1}}`);

    storeHelper.persist.subscribe(model2.getReducerName());
    createReduxStore({
      persist: {
        version: 1,
        key: persistKey,
        storage: 'local',
        allowlist: {
          model,
          model2,
        },
      },
    });

    await sleep(20);

    expect(model.data.counter).toBe(2);
    expect(model2.data.counter).toBe(0);
    done();
  });
});

test('onStoreCreated will invoke on persist done', async () => {
  localStorage.setItem(`ReduxModel:Persist:${persistKey}`, '{"model":"{\\"counter\\":20}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 1,
      key: persistKey,
      storage: 'local',
      allowlist: {
        model,
      },
    },
  });
  storeHelper.persist.subscribe(model.getReducerName());

  await sleep(30);
  expect(model.count).toBe(20);
});
