import React, { FunctionComponent } from 'react';
import { $api } from '../models/ApiService';
import { requestModel } from '../models/RequestModel';

interface OwnProps {
  userId: number;
}

export const Loadings: FunctionComponent<OwnProps> = ({ userId }) => {
  const loadingByUserId = requestModel.getProfileById.useLoadings(userId);
  const loadings2 = requestModel.getProfileById.useLoadings().pick(userId);

  const getProfiles = () => {
    $api.mockResolveValue({}, 10);
    return requestModel.getProfileById(userId);
  };

  return (
    <>
      <div id="loadings1" onClick={getProfiles}>{String(loadingByUserId)}</div>
      <div id="loadings2">{String(loadings2)}</div>
    </>
  );
};
