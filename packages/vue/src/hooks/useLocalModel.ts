import { setModelAlias } from '@redux-model/core';
import * as Vue from 'vue';
import { Model } from '../models/Model';

const slice = Array.prototype.slice;
let counter = 0;

export function useLocalModel<
  T extends new (...args: any[]) => U, U extends Model<any>,
  P = T extends new (...args: any[]) => infer R ? R : never
>(
  CustomModel: T,
  ...args: ConstructorParameters<T>
): P;
export function useLocalModel<T extends Model<any>>(CustomModel: new (...args: any[]) => T): T {
  setModelAlias('local-' + ++counter);
  const model = new CustomModel(...slice.call(arguments, 1));

  Vue.onUnmounted(() => {
    model._unregister();
  });

  return model;
};
