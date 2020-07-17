const ACTION_TYPE_PREFIX = '@ReduxModel/';

const createActionType = (name: string, ...names: string[]): string => {
  return ACTION_TYPE_PREFIX + name + (name.length ? '/' + names.join('/') : '');
};

export const ACTION_TYPE_CLEAR_THROTTLE = createActionType('clear', 'throttle');

export const ACTION_TYPE_REHYDRATE = createActionType('rehydrate');

export const ACTION_TYPE_META_RESTORE = createActionType('meta', 'restore');

export const ACTION_TYPE_ORPHAN_REQUEST = createActionType('orphan', 'http', 'request');
