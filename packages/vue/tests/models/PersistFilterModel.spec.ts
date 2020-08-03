import sleep from 'sleep-promise';
import { PersistFilterModel } from './PersistFilterModel';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { storeHelper } from '@redux-model/core';

test('Initial data will be used if persist data is missing', (done) => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":5}","__persist":{"version":1}}');

  const model = new PersistFilterModel();
  const model2 = new PersistFilterModel();

  createReduxStore({
    reducers: {
      ...model.register(),
      ...model2.register(),
    },
    persist: {
      version: 1,
      key: 'test-persist',
      storage: 'local',
      allowlist: {
        model,
        model2,
      },
    },
  });

  storeHelper.persist.listen(async () => {
    expect(model.data.counter).toBe(15);
    model.increase();
    expect(model.data.counter).toBe(16);

    expect(model2.data.counter).toBe(0);
    model2.increase();
    expect(model2.data.counter).toBe(1);

    await sleep(10);
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":16}","model2":"{\\"counter\\":1}","__persist":{"version":1}}');

    model.increase();
    expect(model.data.counter).toBe(17);

    model2.increase();
    expect(model2.data.counter).toBe(2);

    await sleep(10);
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":17}","model2":"{\\"counter\\":2}","__persist":{"version":1}}');

    done();
  });
});
