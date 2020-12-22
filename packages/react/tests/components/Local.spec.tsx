import React from 'react';
import { create, act } from 'react-test-renderer';
import sleep from 'sleep-promise';
import { Provider } from 'react-redux';
import { createReduxStore } from '../../src/stores/createReduxStore';
import { Local } from './Local';

test('Local model in component', async () => {
  const store = createReduxStore();
  const testRenderer = create(
    <Provider store={store}>
      <Local />
    </Provider>
  );

  const element = testRenderer.root.findByProps({ id: 'increase' });
  const element2 = testRenderer.root.findByProps({ id: 'model2' });

  expect(element.children[0]).toBe('0');
  expect(element2.children[0]).toBe('0');

  await act(async () => {

    let promise = element.props.onClick();
    await sleep(1);
    expect(element.children[0]).toBe('1');
    expect(element2.children[0]).toBe('0');

    element.props.onClick();
    await sleep(1);
    expect(element.children[0]).toBe('2');
    expect(element2.children[0]).toBe('0');

    promise = element2.props.onClick();
    await sleep(1);
    expect(element.children[0]).toBe('2');
    expect(element2.children[0]).toBe('10');

    return promise;
  });
});
