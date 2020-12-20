const own = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

export const shallowEqual = (objA: any, objB: any) => {
  if (baseEqual(objA, objB)) {
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
  switch (toStr.call(objA)) {
    case '[object WeakMap]':
    case '[object WeakSet]':
      return false;
    case '[object Map]':
      return toStr.call(objB) === '[object Map]' && mapEqual(objA, objB);
    case '[object Set]':
      return toStr.call(objB) === '[object Set]' && setEqual(objA, objB);
    default:
      return objectEqual(objA, objB);
  }
};

const baseEqual = (x: any, y: any) => {
  if (x === y) {
    // +0 && -0
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  }

  // NaN && NaN
  return x !== x && y !== y;
};

const objectEqual = (objA: object, objB: object) => {
  const keys = Object.keys(objA), keysLen = keys.length;

  if (keysLen !== Object.keys(objB).length) {
    return false;
  }

  for (let i = 0; i < keysLen; ++i) {
    const key = keys[i];
    if (!own.call(objB, key) || !baseEqual(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
};

const mapEqual = (objA: Map<any, any>, objB: Map<any, any>) => {
  if (objA.size !== objB.size) {
    return false;
  }

  type IteratorResult = ReturnType<IterableIterator<[any, any]>['next']>;

  let entriesA = objA.entries(), entriesB = objB.entries();
  let resultA: IteratorResult, resultB: IteratorResult;

  while (resultA = entriesA.next(), !resultA.done) {
    resultB = entriesB.next();

    if (
      !baseEqual(resultA.value[0], resultB.value[0]) ||
      !baseEqual(resultA.value[1], resultB.value[1])
    ) {
      return false;
    }
  }

  return true;
}

const setEqual = (objA: Set<any>, objB: Set<any>) => {
  if (objA.size !== objB.size) {
    return false;
  }

  type IteratorResult = ReturnType<IterableIterator<any>['next']>;

  let entriesA = objA.values(), entriesB = objB.values();
  let resultA: IteratorResult;

  while (resultA = entriesA.next(), !resultA.done) {
    if (!baseEqual(resultA.value, entriesB.next().value)) {
      return false;
    }
  }

  return true;
}
