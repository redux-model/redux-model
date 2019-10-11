import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { basicModel } from '../models/BasicModel';
import { Provider } from 'react-redux';
import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { $api } from '../models/ApiService';
import BasicConnectComponent from './BasicConnectComponent';
import BasicHooksComponent from './BasicHooksComponent';

for (const Component of [BasicConnectComponent, BasicHooksComponent]) {
  let wrapper: ReactWrapper;

  const getWrapper = () => {
    $api.mockResolveValue();

    return mount(
      <Provider store={createReduxStore({})}>
        <Component userId={3} />
      </Provider>
    );
  };

  beforeEach(() => {
    wrapper = getWrapper();
  });

  afterEach(() => {
    basicModel.clear();
  });

  test('The component can display data from connect()', () => {
    expect(wrapper.find('.id').text()).toBe(basicModel.data.id.toString());
    expect(wrapper.find('.name').text()).toBe(basicModel.data.name);
    expect(wrapper.find('.loading').text()).toBe('false');
    expect(getWrapper().find('.loadings').text()).toBe('true');
  });

  describe('Click button and the data have changed', () => {
    test('Change id', () => {
      expect(wrapper.find('.id').text()).toBe(basicModel.data.id.toString());
      wrapper.find('.change-id').simulate('click');
      expect(wrapper.find('.id').text()).toBe('13');
    });

    test('Change name', () => {
      expect(wrapper.find('.name').text()).toBe(basicModel.data.name);
      wrapper.find('.change-name').simulate('click');
      expect(wrapper.find('.name').text()).toBe('peter');
    });
  });

  test('Fetch profile onMount', (done) => {
    const newWrapper = getWrapper();

    expect(newWrapper.find('.loadings').text()).toBe('true');

    setTimeout(() => {
      expect(newWrapper.find('.loadings').text()).toBe('false');
      done();
    });
  });

  test('Toggle loading', (done) => {
    $api.mockResolveValue({
      id: 67,
      name: 'joo',
    });

    expect(wrapper.find('.loading').text()).toBe('false');
    wrapper.find('.profile').simulate('click');
    expect(wrapper.find('.loading').text()).toBe('true');

    setTimeout(() => {
      expect(wrapper.find('.loading').text()).toBe('false');
      expect(wrapper.find('.id').text()).toBe('67');
      expect(wrapper.find('.name').text()).toBe('joo');
      done();
    });
  });
}
