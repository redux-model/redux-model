import React from 'react';
import { AsyncNodeStorage } from 'redux-persist-node-storage'
import { persistStore, persistReducer } from 'redux-persist';
import { render } from 'enzyme';
import { basicModel } from '../models/BasicModel';
import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { $api } from '../models/ApiService';
import BasicConnectComponent from './BasicConnectComponent';
import BasicHooksComponent from './BasicHooksComponent';
import { PersistGate } from 'redux-persist/integration/react';

for (const Component of [BasicConnectComponent, BasicHooksComponent]) {
  afterEach(() => {
    basicModel.clear();
  });

  const getWrapper = async (id: number, name: string, callback: (wrapper: Cheerio) => void) => {
    const storage = new AsyncNodeStorage('/tmp/redux-persist');

    await storage.setItem('persist:tests', JSON.stringify({
      BasicModel: JSON.stringify({
        id,
        name,
      }),
      _persist: JSON.stringify({
        version: -1,
        rehydrated: true,
      }),
    }));

    const store = createReduxStore({
      onCombineReducers: (reducers) => {
        return persistReducer({
          key: 'tests',
          storage,
        }, reducers);
      },
    });

    Reflect.deleteProperty(store.getState(), '_persist');

    const persistor = persistStore(store, {}, () => {
      callback(wrapper);
    });

    $api.mockResolveValue();
    const { Provider } = require(process.env.TEST_PLATFORM === 'taro' ? '@tarojs/redux' : 'react-redux');

    const wrapper = render(
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <Component userId={3} />
        </PersistGate>
      </Provider>
    );
  };

  test('The component can display data from connect()',  async (done) => {
    await getWrapper(2, 'Jacks', () => {
      expect(basicModel.data.id).toBe(2);
      expect(basicModel.data.name).toBe('Jacks');
    });

    await getWrapper(4, 'Bob', () => {
      expect(basicModel.data.id).toBe(4);
      expect(basicModel.data.name).toBe('Bob');
      done();
    });
  });
}
