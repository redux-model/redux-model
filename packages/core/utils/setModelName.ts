import { isCompressed } from './isCompressed';
import { resetActionCounter } from './setActionName';

const instanceCounter: Record<string, number> = {};
let instanceName: string = '';
let modelCounter: number = 0;

export const setInstanceName = (className: string, alias: string): string => {
  let aliasName = alias ? `.${alias}` : '';

  resetActionCounter();

  if (isCompressed) {
    instanceName = 'm' + aliasName + modelCounter;
    modelCounter += 1;

    return instanceName;
  }

  instanceName = className + aliasName;
  const dictKey = `dict_${instanceName}`;

  if (instanceCounter[dictKey] === undefined) {
    instanceCounter[dictKey] = 0;
  } else {
    instanceCounter[dictKey] += 1;
  }

  if (instanceCounter[dictKey] > 0) {
    instanceName += `-${instanceCounter[dictKey]}`;
  }

  setTimeout(() => {
    // Reset since Hot-Reload will increase counter every time.
    instanceCounter[dictKey] -= 1;
  });

  return instanceName;
};

export const getInstanceName = (): string => {
  return instanceName;
};
