import { createReduxStore } from '../../src';
import { KeepRegisterModel } from './KeepRegisterModel';

let model: KeepRegisterModel;

beforeEach(() => {
  createReduxStore();
});

it ('can keep register by sub model', () => {
  model = new KeepRegisterModel(100, Math.random().toString());
  expect(model.data.count).toBe(100);

  model = new KeepRegisterModel(55, Math.random().toString());
  expect(model.data.count).toBe(55);
});
