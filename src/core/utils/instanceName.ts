import { isDebug } from '../../libs/dev';

let instanceName: string = '';
let actionCounter: number = 0;

// In case the same classname is compressed even when it's dev environment
// The program can be look as compressed if the length of classname is less than 2 characters.
const CLASS_DICT = {};

function isCrushed() {}

const isCompressed = (className: string) => {
  if (typeof isCrushed.name === 'string') {
    return isCrushed.name !== 'isCrushed';
  } else {
    return className.length === 1;
  }
};

export const setInstanceName = (className: string, alias: string): string => {
  instanceName = className + (alias ? `.${alias}` : '');
  actionCounter = 0;

  const dictKey = `dict_${instanceName}`;

  if (CLASS_DICT[dictKey] === undefined) {
    CLASS_DICT[dictKey] = 0;
  } else if (!isDebug() || isCompressed(className)) {
    CLASS_DICT[dictKey] += 1;
  }

  if (CLASS_DICT[dictKey] > 0) {
    instanceName += `-${CLASS_DICT[dictKey]}`;
  }

  return instanceName;
};

export const getInstanceName = (): string => {
  return instanceName;
};

export const increaseActionCounter = (): number => {
  actionCounter += 1;

  return actionCounter;
};
