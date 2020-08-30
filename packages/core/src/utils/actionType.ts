const create = (name: string): string => {
  return '@ReduxModel_' + name;
};

const ACTION_TYPES = {
  persist: create('persist'),
  meta: create('meta'),
};

export default ACTION_TYPES;
