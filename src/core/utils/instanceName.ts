import { isDebug } from '../../libs/dev';

let className: string = '';
let actionCounter: number = 0;

// In case the same classname is compressed even when it's dev environment
// The program can be look as compressed if the length of classname is less than 2 characters.
const CLASS_DICT = {};

export const setInstanceName = (name: string, alias: string): string => {
  className = name + (alias ? `.${alias}` : '');
  actionCounter = 0;

  const dictKey = `dict_${className}`;

  if (CLASS_DICT[dictKey] === undefined) {
    CLASS_DICT[dictKey] = 0;
  } else if (className.length <= 2 || !isDebug()) {
    CLASS_DICT[dictKey] += 1;
  }

  if (CLASS_DICT[dictKey] > 0) {
    className += `-${CLASS_DICT[dictKey]}`;
  }

  return className;
};

export const getInstanceName = (): string => {
  return className;
};

export const increaseActionCounter = (): number => {
  actionCounter += 1;

  return actionCounter;
};
