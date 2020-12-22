import React, { FunctionComponent } from 'react';
import { useLocalModel } from '../../src/hooks/useLocalModel';
import { LocalModel } from '../models/LocalModel';

export const Local: FunctionComponent = () => {
  const model = useLocalModel(LocalModel);
  const model2 = useLocalModel(LocalModel);
  const counter = model.useData((data) => data.counter);
  const counter2 = model2.useData((data) => data.counter);

  const increase = () => {
    model.plus(1);
  };

  const increase2 = () => {
    model2.plus(10);
  };

  return (
    <>
      <div id="increase" onClick={increase}>{counter}</div>
      <div id="model2" onClick={increase2}>{counter2}</div>
    </>
  );
};
