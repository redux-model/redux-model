import { isDebug } from '../../libs/dev';

let className: string = '';
let actionCounter: number = 0;

// In case the same classname by uglify in production mode.
// Do not use this variable in dev mode with hot reloading.
// Remember: Do not create class by the same name, or reducer will be override by another one.
const PROD_CLASS_DICT = {};

export const setInstanceName = (name: string, alias: string): string => {
  className = name + (alias ? `.${alias}` : '');
  actionCounter = 0;

  if (!isDebug()) {
    const dictKey = `dict_${className}`;

    if (PROD_CLASS_DICT[dictKey] === undefined) {
      PROD_CLASS_DICT[dictKey] = 0;
    } else {
      PROD_CLASS_DICT[dictKey] += 1;
    }

    if (PROD_CLASS_DICT[dictKey] > 0) {
      className += `-${PROD_CLASS_DICT[dictKey]}`;
    }
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
