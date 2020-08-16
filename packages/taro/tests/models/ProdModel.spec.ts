import { restoreCompressed } from '../libs/mockCompress';
import * as methods from '@redux-model/core/src/actions/BaseAction';
import { ProdModel } from './ProdModel';

afterAll(() => {
  restoreCompressed();
});

test('getInstanceName will not call for product mode', () => {
  const increseSpier = jest.spyOn(methods, 'increase');

  new ProdModel(Math.random().toString());
  expect(increseSpier).toHaveBeenCalledTimes(2);
  increseSpier.mockRestore();
});
