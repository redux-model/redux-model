import { BaseModel } from '../core/BaseModel';
import { useSelector } from '@tarojs/redux';
import { RequestOptions, UseSelector } from '../core/utils/types';
import { FetchHandle } from '../web/types';
import { BaseRequestAction } from '../core/action/BaseRequestAction';
import { METHOD } from '../core/utils/method';

export abstract class Model<Data = null> extends BaseModel<Data> {
  protected switchReduxSelector<TState = any, TSelected = any>(): UseSelector<TState, TSelected> {
    return useSelector;
  }

  protected connect<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.connect,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }

  protected trace<Response = any, Payload = undefined>(options: RequestOptions<Payload>): FetchHandle<Response, Payload> {
    // @ts-ignore
    return BaseRequestAction.createRequestData({
      method: METHOD.trace,
      middleware: this.getMiddlewareName(),
      ...options,
    });
  }
}
