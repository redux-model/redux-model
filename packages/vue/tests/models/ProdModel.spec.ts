import { restoreCompressed } from '../libs/mockCompress';
import * as methods from '../../src/core/utils/setActionName';
import { ProdModel } from './ProdModel';

afterAll(() => {
  restoreCompressed();
});

test('getInstanceName will not call for product mode', () => {
  const increseSpier = jest.spyOn(methods, 'increaseActionCounter');

  new ProdModel(Math.random().toString());
  expect(increseSpier).toHaveBeenCalledTimes(2);
});
