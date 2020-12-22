import { setModelAlias } from '@redux-model/core';
import * as React from 'react';
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
  const args = arguments;
  const model = React.useMemo(() => {
    setModelAlias('local-' + ++counter);
    return new CustomModel(...slice.call(args, 1));
  }, [CustomModel]);

  React.useEffect(() => () => {
    model._unregister();
  }, [model]);

  return model;
};
