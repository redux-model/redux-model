import React from 'react';
import { create } from 'react-test-renderer';
import { Store } from 'redux';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { Provider } from 'react-redux';
import { Normal } from './Normal';
import sleep from 'sleep-promise';

let store: Store;

beforeAll(() => {
  store = createReduxStore({});
});

test('Increase id with useData()', async () => {
  let testRenderer = create(
    <Provider store={store}>
      <Normal />
    </Provider>
  );

  const instance = testRenderer.root;
  const elemet = instance.findByProps({ id: 'number' });

  expect(elemet.children[0]).toBe('1');
  elemet.props.onClick();
  await sleep(1);
  expect(elemet.children[0]).toBe('4');
});
