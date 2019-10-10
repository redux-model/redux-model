import { TestModel } from './TestModel';
import { createReduxStore } from '../../src/core/utils/createReduxStore';

beforeAll(() => {
  createReduxStore({});
});

let testModel: TestModel;

beforeEach(() => {
  testModel = new TestModel();
});

test('Model has right initialized reducer data', () => {
  expect(testModel.data).toEqual({
    id: 1,
    name: 'init-name',
  });
  expect(testModel.data.age).toBeUndefined();
});

test('Modify data by normal action', () => {
  expect(testModel.data.id).toBe(1);
  testModel.modify({ id: 3 });
  expect(testModel.data.id).toBe(3);

  testModel.modify({ name: 'cool' });
  expect(testModel.data.name).toBe('cool');
});

test('Normal action has successType', () => {
  expect(testModel.modify.getSuccessType()).toContain('TestModel');
  expect(testModel.modify.getSuccessType()).toContain('success');
});

test('Easy to use changeReducer by non-action method', () => {
  testModel.modifyByMethod(10002);
  expect(testModel.data.id).toBe(10002);

  testModel.modifyByMethod(200);
  expect(testModel.data.id).toBe(200);

  testModel.modifyByMethod(230);
  expect(testModel.data.id).toBe(230);
});

test('Reducer effect can return new object', () => {
  expect(testModel.data.id).toBe(1);
  testModel.returnNewObject();
  expect(testModel.data.id).toBe(100);
  expect(testModel.data.name).toBe('peter');
});

test('One model can have many instance', () => {
  const testModel_1 = new TestModel('my-alias');
  expect(testModel_1.modify.getSuccessType()).toContain('my-alias');
});
