import { ActionResponse, HttpServiceNoMeta, HttpServiceWithMeta, HttpServiceWithMetas } from '../utils/types';
import { ActionRequest } from '../../libs/types';

export declare class HttpServiceHandle<Data, Response, Payload = unknown, M = false> {
  query(query: object): this;

  body(body: object): this;

  successText(text: string): this;

  failText(text: string): this;

  requestOptions(options: ActionRequest['requestOptions']): this;

  hideError(is: boolean | ((response: ActionResponse<Data, Response, Payload>) => boolean)): this;

  payload<T extends Payload>(payload: T): M extends true
    ? HttpServiceWithMeta<Data, Response, T>
    : HttpServiceNoMeta<Data, Response, T>;

  metaKey(is: true): HttpServiceWithMeta<Data, Response, Payload>;
  metaKey(is: false): HttpServiceNoMeta<Data, Response, Payload>;
  metaKey<T extends keyof Payload>(payloadKey: T): HttpServiceWithMetas<Data, Response, Payload, T>;

  onPrepare(fn: NonNullable<ActionRequest<Data, Response, Payload>['onPrepare']>): this;
  onSuccess(fn: NonNullable<ActionRequest<Data, Response, Payload>['onSuccess']>): this;
  onFail(fn: NonNullable<ActionRequest<Data, Response, Payload>['onFail']>): this;
}
