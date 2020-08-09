import { METHOD } from '../utils/method';
import { IBaseRequestAction } from '../actions/BaseRequestAction';
import { ThrottleOptions } from './HttpServiceBuilder';
import ACTION_TYPES from '../utils/actionType';

export type OrphanRequestOptions<T> = Partial<Pick<IBaseRequestAction, 'uri' | 'query' | 'body' | 'requestOptions' >> &
  {
    uri: string;
    requestOptions?: T;
    throttle?: ThrottleOptions;
  };

export class OrphanHttpService<T = object> {
  protected readonly uniqueId: number;
  protected readonly config: OrphanRequestOptions<T>;
  protected readonly method: METHOD = METHOD.get;

  constructor(config: OrphanRequestOptions<T>, method: METHOD, uniqueId: number) {
    this.config = config;
    this.uniqueId = uniqueId;
    this.method = method;
  }

  collect(): IBaseRequestAction {
    const config = this.config;
    const { throttle } = config;

    const action: IBaseRequestAction = {
      uniqueId: this.uniqueId,
      body: config.body || {},
      query: config.query || {},
      successText: '',
      failText: '',
      hideError: true,
      requestOptions: config.requestOptions || {},
      uri: config.uri,
      type: {
        prepare: '',
        success: ACTION_TYPES.httpRequest,
        fail: '',
      },
      method: this.method,
      throttle: throttle
        ? {
          enable: throttle.duration > 0 && throttle.enable !== false,
          duration: throttle.duration,
          transfer: throttle.transfer || null,
          key: '',
        }
        : {
          enable: false,
          duration: 0,
          transfer: null,
          key: '',
        },
      metaKey: false,
      metaActionName: '',
      payload: undefined,
      onPrepare: null,
      afterPrepare: null,
      onSuccess: null,
      afterSuccess: null,
      onFail: null,
      afterFail: null,
      modelName: '',
    };

    return action;
  }
}
