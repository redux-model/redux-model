import { BaseAction } from './BaseAction';
import { RequestSubscriber, IsPayload } from '../utils/types';
import { HttpServiceHandle } from '../service/HttpServiceHandle';

export declare abstract class BaseRequestAction<Data, A extends (...args: any[]) => HttpServiceHandle<Response, Payload>, Response, Payload, M extends IsPayload<Payload>> extends BaseAction<Data> {
  onSuccess<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;
  onPrepare<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;
  onFail<CustomData>(effect: RequestSubscriber<CustomData, Response, Payload>['effect']): RequestSubscriber<CustomData, Response, Payload>;

  getPrepareType(): string;
  getFailType(): string;
}
