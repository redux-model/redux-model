const ACTION_TYPE_PREFIX = '@ReduxModel/';

const createActionType = (name: string, ...others: string[]): string => {
  return ACTION_TYPE_PREFIX + name + (others.length ? '/' + others.join('/') : '');
};

export const ACTION_TYPE_CLEAR_ACTION_THROTTLE = createActionType('clear', 'action', 'throttle');

export const ACTION_TYPE_REHYDRATE = createActionType('rehydrate');

export const ACTION_TYPE_META_RESTORE = createActionType('meta', 'restore');

export const ACTION_TYPE_ORPHAN_REQUEST = createActionType('orphan', 'http', 'request');
