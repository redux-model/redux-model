import { createReduxStore } from '../../src/core/utils/createReduxStore';
import { ProdModel } from './ProdModel';

jest.mock('../../src/libs/dev');
const dev = require('../../src/libs/dev');
let model: ProdModel;

beforeAll(() => {
  createReduxStore({});

  dev.isDebug.mockImplementation(() => false);
});

afterAll(() => {
  jest.unmock('../../src/libs/dev');
});

beforeEach(() => {
  model = new ProdModel();
});

afterEach(() => {
  model.clear();
});

test('The action name contains the property name in model by Proxy', () => {
  expect(model.increase.getSuccessType()).toContain(model.constructor.name);
  expect(model.increase.getSuccessType()).not.toContain('increase');

  expect(model.fetchSomething.getPrepareType()).not.toContain('fetchSomething');
});
