import { PureComponent, ReactNode } from 'react';
import { storeHelper, isCompressed } from '../core';

interface Props {
  loading?: ReactNode;
}

type State = Readonly<{
  isReady: boolean;
}>;

export class PersistGate extends PureComponent<Props, State> {
  protected unlisten?: Function;

  readonly state: State = {
    isReady: storeHelper.persist.isReady(),
  };

  componentDidMount(): void {
    const { isReady } = this.state;

    if (!isReady) {
      this.unlisten = storeHelper.persist.listen(() => {
        this.setState({
          isReady: true,
        });
      });
    }
  }

  componentWillUnmount() {
    this.unlisten?.();
  }

  render(): ReactNode {
    const { children, loading } = this.props;
    const { isReady } = this.state;

    if (!isCompressed && loading && typeof children === 'function') {
      console.error('ReduxModel: PersistGate expects either a function child or loading prop. The loading prop will be ignored.');
    }

    if (typeof children === 'function') {
      return children(isReady);
    }

    return isReady ? children : loading;
  }
}
