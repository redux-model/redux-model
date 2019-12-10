function ReduxModel() {}

const classCounter = {};
const isCompressed = typeof ReduxModel.name === 'string' && ReduxModel.name !== 'ReduxModel';
let instanceName: string = '';
let actionCounter: number = 0;

export const setInstanceName = (className: string, alias: string): string => {
  instanceName = className + (alias ? `.${alias}` : '');
  actionCounter = 0;

  const dictKey = `dict_${instanceName}`;

  if (classCounter[dictKey] === undefined) {
    classCounter[dictKey] = 0;
  } else {
    classCounter[dictKey] += 1;
  }

  if (classCounter[dictKey] > 0) {
    instanceName += `-${classCounter[dictKey]}`;
  }

  // Hot-Reload can't be supported when bundle is compressed.
  if (!isCompressed) {
    // Low compact: User shouldn't create the same classname. Otherwise, alias is required.
    // Low compact: User must instance the same class at the same time. Otherwise, alias is required.
    setTimeout(() => {
      classCounter[dictKey] -= 1;
    });
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
