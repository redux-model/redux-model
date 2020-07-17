import React from 'react';
import { create } from 'react-test-renderer';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { Provider } from 'react-redux';
import { Normal } from './Normal';
import sleep from 'sleep-promise';
import { PersistGate } from '../../src';
import { storeHelper } from '@redux-model/core';

test('Increase id with useData()', (done) => {
  const store = createReduxStore({
    persist: {
      key: 'abc',
      version: '1',
      storage: 'local',
      allowlist: {},
    }
  });

  let testRenderer = create(
    <Provider store={store}>
      <PersistGate>
        <Normal />
      </PersistGate>
    </Provider>
  );

  storeHelper.persist.listenOnce(async () => {
    const instance = testRenderer.root;
    const elemet = instance.findByProps({ id: 'number' });

    expect(elemet.children[0]).toBe('1');
    elemet.props.onClick();
    await sleep(1);
    expect(elemet.children[0]).toBe('4');

    done();
  });
});
