import { SubDispatchModel } from './SubDispatchModel';
import { createReduxStore } from '../../src/core/utils/store';
import { basicModel } from './BasicModel';
import { $api } from './ApiService';
import { requestModel } from './RequestModel';

const data = {
  id: 1463,
  name: 'Join',
  age: 30,
};

let model: SubDispatchModel;

beforeAll(() => {
  createReduxStore({});
});

beforeEach(() => {
  model = new SubDispatchModel();
});

afterEach(() => {
  model.clear();
  basicModel.clear();
  requestModel.clear();
});

test('Run sub normal action', () => {
  model.subDispatch(3000);
  expect(model.data.id).toBe(3000);
  expect(model.data.name).toBe('Kite');

  model.subDispatch(4000);
  expect(model.data.id).toBe(4000);
  expect(model.data.name).toBe('Kite');
});

test('Change data before sub action', () => {
  model.changeBeforeSubAction();
  expect(model.data.id).toBe(100);
  expect(model.data.name).toBe('Jim');
});

test('Run multi sub action', () => {
  model.multiSubAction();
  expect(model.data.id).toBe(15);
  expect(model.data.name).toBe('YoYo');
});

test('Call sub action from other model', () => {
  model.callOtherModelAction(5656);
  expect(model.data.id).toBe(5656);
  expect(basicModel.data.id).toBe(5656);
});

test('Call multi sub actions from other model', () => {
  $api.mockResolveValue(data);

  model.callMultiOtherModelAction(data.id);

  expect(model.data.id).toBe(data.id);
  expect(basicModel.data.id).toBe(data.id);
  expect(requestModel.getProfileById.loadings.pick(data.id)).toBeTruthy();
});

test('Only call multi sub actions from other model', () => {
  $api.mockResolveValue(data);

  model.onlyCallOtherModelAction(data.id);

  expect(basicModel.data.id).toBe(data.id);
  expect(requestModel.getProfileById.loadings.pick(data.id)).toBeTruthy();
});

test('Run sub request action', () => {
  $api.mockResolveValue(data);

  expect(requestModel.getProfileById.loadings.pick(data.id)).toBeFalsy();
  model.requestActionInNormalAction(data.id);
  expect(requestModel.getProfileById.loadings.pick(data.id)).toBeTruthy();
  expect(requestModel.getProfileById.metas.pick(data.id).actionType).toBe(requestModel.getProfileById.getPrepareType());
});

test('Sub action is not allowed to return new data', () => {
  expect(() => model.notAllowNewObject()).toThrowError();
});
