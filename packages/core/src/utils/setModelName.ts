import { isCompressed } from './isCompressed';
import { resetActionCounter } from './setActionName';

const instanceCounter: Record<string, number> = {};
let instanceName: string = '';
let modelCounter: number = 0;

export const setModelName = (className: string, alias: string): string => {
  resetActionCounter();

  if (isCompressed()) {
    return 'm' + ++modelCounter;
  }

  instanceName = className + (alias ? `.${alias}` : '');
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
