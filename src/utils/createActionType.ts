const ACTION_TYPE_PREFIX = '@ReduxModel/';

export const createActionType = (name: string, ...names: string[]): string => {
  return ACTION_TYPE_PREFIX + name + '/' + names.join('/');
};
