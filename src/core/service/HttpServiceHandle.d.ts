import { ReducerAction, HttpServiceNoMeta, HttpServiceWithMeta, HttpServiceWithMetas } from '../utils/types';
import { ActionRequest } from '../../libs/types';

export declare class HttpServiceHandle<Data, Response, Payload = unknown, M = false> {
  query(query: object): this;

  body(body: object): this;

  successText(text: string): this;

  failText(text: string): this;

  requestOptions(options: ActionRequest['requestOptions']): this;

  hideError(is: boolean | ((response: ReducerAction<Response, Payload>) => boolean)): this;

  payload<T extends Payload>(payload: T): M extends true
    ? HttpServiceWithMeta<Data, Response, T>
    : M extends false
      ? HttpServiceNoMeta<Data, Response, T>
      : HttpServiceWithMetas<Data, Response, T, M>;

  withMeta(is: true): HttpServiceWithMeta<Data, Response, Payload>;
  withMeta(is: false): HttpServiceNoMeta<Data, Response, Payload>;
  withMeta(value: string): HttpServiceWithMetas<Data, Response, Payload, string>;
  withMeta(value: number): HttpServiceWithMetas<Data, Response, Payload, number>;
  withMeta(value: symbol): HttpServiceWithMetas<Data, Response, Payload, symbol>;

  onPrepare(fn: NonNullable<ActionRequest<Data, Response, Payload>['onPrepare']>): this;
  onSuccess(fn: NonNullable<ActionRequest<Data, Response, Payload>['onSuccess']>): this;
  onFail(fn: NonNullable<ActionRequest<Data, Response, Payload>['onFail']>): this;
}
