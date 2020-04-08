import { SubDispatchModel } from './SubDispatchModel';
import { createReduxStore } from '../../src/core/utils/store';
import { basicModel } from './BasicModel';
import { $api } from './ApiService';
import { requestModel } from './RequestModel';


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

test('Run sub request action', () => {
  const data = {
    id: 1463,
    name: 'Join',
    age: 30,
  };

  $api.mockResolveValue(data);


  expect(requestModel.getProfileById.loadings.pick(data.id)).toBeFalsy();
  model.requestActionInNormalAction(data.id);
  expect(requestModel.getProfileById.loadings.pick(data.id)).toBeTruthy();
  expect(requestModel.getProfileById.metas.pick(data.id).actionType).toBe(requestModel.getProfileById.getPrepareType());
});

test('Sub action is not allowed to return new data', () => {
  expect(() => model.notAllowNewObject()).toThrowError();
});
