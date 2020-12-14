const own = Object.prototype.hasOwnProperty;
const str = Object.prototype.toString;

const equal = (x: any, y: any) => {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  }

  // NaN !== NaN
  return x !== x && y !== y;
};

export const shallowEqual = (objA: any, objB: any) => {
  if (equal(objA, objB)) {
    return true;
  }

  if (
    objA === null ||
    objB === null ||
    typeof objA !== 'object' ||
    typeof objB !== 'object'
  ) {
    return false;
  }

  // The map and set are different from plain object, Object.key(map) always returns [].
  switch (str.call(objA)) {
    case '[object Map]':
    case '[object Set]':
    case '[object WeakMap]':
    case '[object WeakSet]':
      return false;
  }

  // For plain object
  const keys = Object.keys(objA), keysLen = keys.length;

  if (keysLen !== Object.keys(objB).length) {
    return false;
  }

  for (let i = 0; i < keysLen; ++i) {
    const key = keys[i];
    if (!own.call(objB, key) || !equal(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
};
