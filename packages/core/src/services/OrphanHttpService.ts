import { METHOD } from '../utils/method';
import { IBaseRequestAction } from '../actions/BaseRequestAction';
import { ThrottleOptions } from './HttpServiceBuilder';

export type OrphanRequestOptions<T> = Partial<Pick<IBaseRequestAction, 'uri' | 'query' | 'body' | 'requestOptions' >> &
  {
    uri: string;
    requestOptions?: T;
    throttle?: ThrottleOptions;
  };

export class OrphanHttpService<T = object> {
  protected readonly config: OrphanRequestOptions<T>;
  protected readonly method: METHOD = METHOD.get;

  constructor(config: OrphanRequestOptions<T>, method: METHOD) {
    this.config = config;
    this.method = method;
  }

  collect(): IBaseRequestAction {
    const config = this.config;
    const { throttle } = config;

    const action: IBaseRequestAction = {
      body: config.body || {},
      query: config.query || {},
      successText: '',
      failText: '',
      hideError: true,
      requestOptions: config.requestOptions || {},
      uri: config.uri,
      type: {
        prepare: '',
        success: '',
        fail: '',
      },
      method: this.method,
      throttle: throttle
        ? {
          enable: throttle.duration > 0 && throttle.enable !== false,
          duration: throttle.duration,
          transfer: throttle.transfer,
          key: '',
        }
        : {
          enable: false,
          duration: 0,
          transfer: undefined,
          key: '',
        },
      metaKey: false,
      actionName: '@async/request',
      payload: undefined,
      modelName: '',
    };

    return action;
  }
}
