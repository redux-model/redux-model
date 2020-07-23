import React from 'react';
import { create, act } from 'react-test-renderer';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { Provider } from 'react-redux';
import { Loadings } from './Loadings';
import sleep from 'sleep-promise';

test('Request with useLoadings()', async () => {
  const store = createReduxStore();
  const testRenderer = create(
    <Provider store={store}>
      <Loadings userId={10} />
    </Provider>
  );

  const element = testRenderer.root.findByProps({ id: 'loadings1' });
  const element2 = testRenderer.root.findByProps({ id: 'loadings2' });

  expect(element.children[0]).toBe('false');
  expect(element2.children[0]).toBe('false');

  await act(async () => {
    const promise = element.props.onClick();

    await sleep(1);
    expect(element.children[0]).toBe('true');
    expect(element2.children[0]).toBe('true');

    return promise;
  });

  expect(element.children[0]).toBe('false');
  expect(element2.children[0]).toBe('false');
});
