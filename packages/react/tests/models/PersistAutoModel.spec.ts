import sleep from 'sleep-promise';
import { PersistAutoModel } from './PersistAutoModel';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { storeHelper } from '../../src/core';

test('Initial data will be used if persist data is missing', (done) => {
  localStorage.setItem('ReduxModel:Persist:test-persist', '{"model":"{\\"counter\\":5}","__persist":{"version":1}}');

  createReduxStore({
    persist: {
      version: 1,
      key: 'test-persist',
      storage: 'local',
      allowlist: {
        model: 'PersistAutoModel.a',
        model2: 'PersistAutoModel.b',
      },
    },
  });

  storeHelper.persist.listen(async () => {
    const model = new PersistAutoModel('a');
    const model2 = new PersistAutoModel('b');

    expect(model.data.counter).toBe(5);
    model.increase();
    expect(model.data.counter).toBe(6);

    expect(model2.data.counter).toBe(0);
    model2.increase();
    expect(model2.data.counter).toBe(1);

    await sleep(10);
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":6}","model2":"{\\"counter\\":1}","__persist":{"version":1}}');

    model.increase();
    expect(model.data.counter).toBe(7);

    model2.increase();
    expect(model2.data.counter).toBe(2);

    await sleep(10);
    expect(localStorage.getItem('ReduxModel:Persist:test-persist')).toBe('{"model":"{\\"counter\\":7}","model2":"{\\"counter\\":2}","__persist":{"version":1}}');

    done();
  });
});
