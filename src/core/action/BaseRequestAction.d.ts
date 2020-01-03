import { BaseAction } from './BaseAction';
import { RequestSubscriber } from '../utils/types';
import { HttpServiceBuilder } from '../service/HttpServiceBuilder';

export declare abstract class BaseRequestAction<Data, A extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, M>, Response, Payload, M> extends BaseAction {
  onSuccess<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;
  onPrepare<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;
  onFail<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;

  getPrepareType(): string;
  getFailType(): string;
  // Clear all throttle cache in this action
  clearThrottle(): void;
}
