import React from 'react';
import { create, act } from 'react-test-renderer';
import sleep from 'sleep-promise';
import { Provider } from 'react-redux';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { Loading } from './Loading';

test('Request with useLoading()', async () => {
  const store = createReduxStore({});
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
