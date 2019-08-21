import { BaseAction } from './BaseAction';
import { RequestSubscriber } from '../utils/types';
import { FetchHandle } from '../../libs/types';

export declare abstract class BaseRequestAction<Data, A extends (...args: any[]) => FetchHandle<Response, Payload>, Response, Payload> extends BaseAction<Data> {
  onSuccess<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;
  onPrepare<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;
  onFail<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;

  getPrepareType(): string;
  getFailType(): string;
}
