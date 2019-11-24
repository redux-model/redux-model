import { PureComponent, ReactNode } from 'react';
import { isPersistReady, onPersistReady } from '../core/utils/persist';

type State = Readonly<{
  isReady: boolean;
}>;

export class PersistGate extends PureComponent<{}, State> {
  readonly state: State = {
    isReady: isPersistReady(),
  };

  componentDidMount(): void {
    const { isReady } = this.state;

    if (!isReady) {
      onPersistReady(() => {
        this.setState({
          isReady: true,
        });
      });
    }
  }

  render(): ReactNode {
    const { children } = this.props;
    const { isReady } = this.state;

    return isReady ? children : null;
  }
}
