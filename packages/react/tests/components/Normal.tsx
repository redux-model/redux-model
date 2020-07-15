import React, { FunctionComponent } from 'react';
import { basicModel } from '../models/BasicModel';

export const Normal: FunctionComponent = () => {
  const id = basicModel.useData((data) => {
    return data.id;
  });

  const increase = () => {
    basicModel.modify({
      id: 4,
    });
  };

  return <div id="number" onClick={increase}>{id}</div>;
};
