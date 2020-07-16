import React, { FunctionComponent } from 'react';
import { basicModel } from '../models/BasicModel';
import { $api } from '../libs/ApiService';

export const Loading: FunctionComponent = () => {
  const loading = basicModel.getProfile.useLoading();

  const getProfile = () => {
    $api.mockResolveValue({
      id: 67,
      name: 'joo',
    }, 10);

    return basicModel.getProfile();
  };

  return (
    <div id="boolean" onClick={getProfile}>{String(loading)}</div>
  );
};
