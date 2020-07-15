import React from 'react';
import { create, act } from 'react-test-renderer';
import { Store } from 'redux';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { Provider } from 'react-redux';
import { Loading } from './Loading';
//import sleep from 'sleep-promise';
import sleep from 'sleep-promise';

let store: Store;

beforeAll(() => {
  store = createReduxStore({});
});

test('Request with useLoading()', async () => {
  const testRenderer = create(
    <Provider store={store}>
      <Loading />
    </Provider>
  );

  const element = testRenderer.root.findByProps({ id: 'boolean' });

  expect(element.children[0]).toBe('false');

  await act(async () => {
    const promise = element.props.onClick();

    await sleep(1);
    expect(element.children[0]).toBe('true');

    return promise;
  });

  expect(element.children[0]).toBe('false');
});
