import { createDraft, finishDraft, enableMapSet } from 'immer';
import { shallowEqual } from '../../src';

describe('shallowEqual', () => {
  test('number', () => {
    expect(shallowEqual(0, 0)).toBeTruthy();
    expect(shallowEqual(1, 1)).toBeTruthy();
    expect(shallowEqual(NaN, NaN)).toBeTruthy();

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
    expect(shallowEqual(new Map(), new Map())).toBeFalsy();

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

  test('Set', () => {
    expect(shallowEqual(new Set(), new Set())).toBeFalsy();

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
});
