import { isCompressed } from './isCompressed';
import { AnyModel } from '../models/BaseModel';

const instanceCounter: Record<string, number> = {};
let modelCounter: number = 0;
let currentModel: AnyModel;

export const getModel = (): AnyModel => {
  return currentModel;
};

export const setModel = (model: AnyModel, alias?: string): string => {
  currentModel = model;

  if (isCompressed()) {
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
