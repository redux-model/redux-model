import React, { FunctionComponent, useEffect } from 'react';
import { basicModel } from '../../models/BasicModel';
import BasicComponent from './BasicComponent';
import { requestModel } from '../../models/RequestModel';

interface OwnProps {
  userId: number;
}

const BasicHooksComponent: FunctionComponent<OwnProps> = ({ userId }) => {
  const id = basicModel.useData((item) => item.id);
  const name = basicModel.useData((item) => item.name);
  const loading = basicModel.getProfile.useLoading();
  const loadingByUserId = requestModel.getProfileById.useLoadings(userId);

  useEffect(() => {
    requestModel.getProfileById(userId);
  }, [userId]);

  return <BasicComponent id={id} name={name} loading={loading} loadingByUserId={loadingByUserId} />;
};

export default BasicHooksComponent;
