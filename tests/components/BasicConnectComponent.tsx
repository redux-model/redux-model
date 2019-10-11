import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { basicModel } from '../models/BasicModel';
import BasicComponent from './BasicComponent';
import { requestModel } from '../models/RequestModel';

interface OwnProps {
  userId: number;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

class BasicConnectComponent extends PureComponent<Props> {
  componentDidMount(): void {
    const { userId } = this.props;

    requestModel.getProfileById(userId);
  }

  render() {
    const { userId, ...rest } = this.props;

    return <BasicComponent {...rest} />;
  }
}

const mapStateToProps = (_, { userId }: OwnProps) => {
  return {
    id: basicModel.data.id,
    name: basicModel.data.name,
    loading: basicModel.getProfile.loading,
    loadingByUserId: requestModel.getProfileById.loadings.pick(userId),
  };
};

export default connect(mapStateToProps)(BasicConnectComponent);
