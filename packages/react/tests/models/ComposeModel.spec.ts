import { createReduxStore } from '../../src/stores/createReduxStore';
import { ComposeModel } from './ComposeModel';
import { $api } from '../libs/ApiService';

let model: ComposeModel;

beforeAll(() => {
  createReduxStore({});
});

beforeEach(() => {
  model = new ComposeModel(Math.random().toString());
});

test('Compose action has loading process', (done) => {
  expect(model.manage.loading).toBeFalsy();

  $api.mockResolveValue({});
  $api.mockResolveValue({
    id: 100,
  });

  const promise = model.manage();

  expect(model.manage.loading).toBeTruthy();

  promise.then(() => {
    expect(model.manage.loading).toBeFalsy();
    expect(model.data.id).toBe(100);
    done();
  });
});

test('Componse action has 3 kinds of type', () => {
  expect(model.manage.getPrepareType()).toContain('manage prepare');
  expect(model.manage.getSuccessType()).toContain('manage success');
  expect(model.manage.getFailType()).toContain('manage fail');
});
