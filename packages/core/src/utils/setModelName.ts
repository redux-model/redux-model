import { isCompressed } from './isCompressed';

const instanceCounter: Record<string, number> = {};
let instanceName: string = '';
let modelCounter: number = 0;

export const setModelName = (className: string, alias: string): string => {
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
