import React, { Fragment, FunctionComponent } from 'react';
import { basicModel } from '../models/BasicModel';

interface Props {
  id: number;
  name: string;
  loading: boolean;
  loadingByUserId: boolean;
}

const BasicComponent: FunctionComponent<Props> = (props) => {
  const { id, name, loading, loadingByUserId } = props;

  return (
    <Fragment>
      <div className="id">{id}</div>
      <div className="name">{name}</div>
      <div className="loading">{String(loading)}</div>
      <div className="loadings">{String(loadingByUserId)}</div>
      <button
        className="change-id"
        onClick={() => basicModel.modify({ id: 13 })}
      >
        Click me
      </button>
      <button
        className="change-name"
        onClick={() => basicModel.modify({ name: 'peter' })}
      >
        Click me
      </button>
      <button
        className="profile"
        onClick={() => basicModel.getProfile()}
      >
        Get profile
      </button>
    </Fragment>
  );
};

export default BasicComponent;
