import { createDraft, finishDraft, enableMapSet } from 'immer';
import { shallowEqual } from '../../src';

describe('shallowEqual', () => {
  test('number', () => {
    expect(shallowEqual(0, 0)).toBeTruthy();
    expect(shallowEqual(1, 1)).toBeTruthy();
    expect(shallowEqual(NaN, NaN)).toBeTruthy();

    expect(shallowEqual(+0, -0)).toBeFalsy();
    expect(shallowEqual(1, 2)).toBeFalsy();
  });

  test('string', () => {
    expect(shallowEqual('hello', 'hello')).toBeTruthy();

    expect(shallowEqual('hello', 'world')).toBeFalsy();
    expect(shallowEqual('hello', '')).toBeFalsy();
  });

  test('plain object', () => {
    const obj = {};
    expect(shallowEqual(obj, obj)).toBeTruthy();
    expect(shallowEqual({}, {})).toBeTruthy();
    expect(shallowEqual({ a: 1 }, { a: 1 })).toBeTruthy();

    expect(shallowEqual({ a: 1 }, { a: 2 })).toBeFalsy();
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBeFalsy();
    expect(shallowEqual({ toString: () => {} }, {})).toBeFalsy();
  });

  test('Map', () => {
    enableMapSet();
    const map = new Map();
    const draft1 = createDraft(map);
    draft1.set('test', 1);
    const map1 = finishDraft(draft1);
    expect(shallowEqual(map, map1)).toBeFalsy();
    // Freezed
    expect(() => map1.set('hello', 'world')).toThrow();

    const draft2 = createDraft(map1);
    draft2.set('test', 1);
    expect(shallowEqual(finishDraft(draft2), map1)).toBeTruthy();
  });

  test ('Map without immer', () => {
    const obj = {};
    const map1 = new Map();
    const map2 = new Map();
    expect(shallowEqual(map1, map2)).toBeTruthy();

    map1.set('hello', 'world');
    map2.set('hello', 'world');
    map1.set(undefined, 'world');
    map2.set(undefined, 'world');
    map1.set(null, 'null');
    map2.set(null, 'null');
    map1.set(obj, 'object');
    map2.set(obj, 'object');
    map1.set(123, 'number');
    map2.set(123, 'number');
    expect(shallowEqual(map1, map2)).toBeTruthy();

    map2.set(obj, 'object2');
    expect(shallowEqual(map1, map2)).toBeFalsy();
    map2.set(obj, 'object');
    expect(shallowEqual(map1, map2)).toBeTruthy();

    map1.set({}, 'obj');
    map2.set({}, 'obj');
    expect(shallowEqual(map1, map2)).toBeFalsy();
  });

  test('Map with different sequence', () => {
    const map1 = new Map();
    const map2 = new Map();

    map1.set('a', '1');
    map2.set('b', '2');
    map1.set('b', '2');
    map2.set('a', '1');
    expect(shallowEqual(map1, map2)).toBeFalsy();
  });

  test('Set', () => {
    enableMapSet();
    const map = new Set();
    const draft1 = createDraft(map);
    draft1.add('hello');
    const map1 = finishDraft(draft1);
    expect(shallowEqual(map, map1)).toBeFalsy();
    // Freezed
    expect(() => map1.add('world')).toThrow();

    const draft2 = createDraft(map1);
    draft2.add('hello');
    expect(shallowEqual(finishDraft(draft2), map1)).toBeTruthy();
  });

  test('Set without immer', () => {
    const obj = {};
    const set1 = new Set();
    const set2 = new Set();
    expect(shallowEqual(set1, set2)).toBeTruthy();

    set1.add('hello');
    set2.add('hello');
    set1.add(obj);
    set2.add(obj);
    set1.add(undefined);
    set2.add(undefined);
    set1.add(null);
    set2.add(null);
    set1.add(123);
    set2.add(123);
    expect(shallowEqual(set1, set2)).toBeTruthy();

    set1.add({});
    set2.add({});
    expect(shallowEqual(set1, set2)).toBeFalsy();
  });

  test('Set with different sequence', () => {
    const set1 = new Set();
    const set2 = new Set();

    set1.add('a');
    set2.add('b');
    set1.add('b');
    set2.add('a');
    expect(shallowEqual(set1, set2)).toBeFalsy();
  });

  test('WeakMap', () => {
    const map1 = new WeakMap();
    const map2 = new WeakMap();
    expect(shallowEqual(map1, map2)).toBeFalsy();
  });

  test('WeakSet', () => {
    const set1 = new WeakSet();
    const set2 = new WeakSet();
    expect(shallowEqual(set1, set2)).toBeFalsy();
  });
});
