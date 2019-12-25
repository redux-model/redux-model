import { Component } from '@tarojs/taro';
import { isPersistReady, onPersistReady } from '../core/utils/persist';

type State = Readonly<{
  isReady: boolean;
}>;

export class PersistGate extends Component<object, State> {
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

  render() {
    const { children } = this.props;
    const { isReady } = this.state;

    return isReady ? children : null;
  }
}
