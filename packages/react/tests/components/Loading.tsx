import React, { FunctionComponent } from 'react';
import { basicModel } from '../models/BasicModel';
import { $api } from '../libs/ApiService';
import { requestModel } from '../models/RequestModel';
import { Model } from '../../src';

export const Loading: FunctionComponent = () => {
  const loading = basicModel.getProfile.useLoading();

  const combineLoading = Model.useLoading(
    loading,
    requestModel.getProfile.useLoading(),
    requestModel.getProfileById.useLoadings().pick(1),
  );

  const getProfile = () => {
    $api.mockResolveValue({
      id: 67,
      name: 'joo',
    }, 10);

    return basicModel.getProfile();
  };

  return (
    <div id="boolean" onClick={getProfile}>{String(combineLoading)}</div>
  );
};
