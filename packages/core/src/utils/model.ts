import { isCrushed } from './isCrushed';
import { AnyModel } from '../models/BaseModel';

const instanceCounter: Record<string, number> = {};
let modelCounter: number = 0;
let currentModel: AnyModel;

export const getCurrentModel = (): AnyModel => {
  return currentModel;
};

export const getModelName = (model: AnyModel, alias?: string): string => {
  if (isCrushed()) {
    return 'm' + ++modelCounter;
  }

  let instanceName = model.constructor.name + (alias ? `.${alias}` : '');
  const key = instanceName;

  if (instanceCounter[key] === undefined) {
    instanceCounter[key] = 0;
  } else {
    ++instanceCounter[key];
  }

  if (instanceCounter[key] > 0) {
    instanceName += `-${instanceCounter[key]}`;
  }

  setTimeout(() => {
    // Reset due to Hot-Reload will increase counter.
    --instanceCounter[key];
  });

  return instanceName;
};

export const setCurrentModel = (model: AnyModel): void => {
  currentModel = model;
};

const methodName = '_register';

export function initModel<T extends new (...args: any[]) => AnyModel>(this: T, ...args: ConstructorParameters<T>): InstanceType<T>;
export function initModel<T extends new (...args: any[]) => AnyModel>(this: T): InstanceType<T> {
  const CustomModel = this;
  const proto = CustomModel.prototype;
  let originalRegister: Function = proto[methodName];

  proto[methodName] = function() {
    proto[methodName] = originalRegister;
  };

  const model = new CustomModel(...arguments);

  model[methodName]();

  // @ts-ignore
  return model;
};
