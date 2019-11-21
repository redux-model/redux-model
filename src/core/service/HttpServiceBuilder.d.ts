import { ReducerAction, HttpServiceWithMeta, HttpServiceWithMetas } from '../utils/types';
import { ActionRequest } from '../../libs/types';

export declare class HttpServiceBuilder<Data, Response, Payload = unknown, M = true> {
  query(query: object): this;

  body(body: object): this;

  successText(text: string): this;

  failText(text: string): this;

  requestOptions(options: ActionRequest['requestOptions']): this;

  hideError(is: boolean | ((response: ReducerAction<Response, Payload>) => boolean)): this;

  throttle(millSeconds: number, useCache?: boolean): this;

  payload<T extends Payload>(payload: T): M extends true
    ? HttpServiceWithMeta<Data, Response, T>
    : HttpServiceWithMetas<Data, Response, T, M>;

  metas(value: string): HttpServiceWithMetas<Data, Response, Payload, string>;
  metas(value: number): HttpServiceWithMetas<Data, Response, Payload, number>;
  metas(value: symbol): HttpServiceWithMetas<Data, Response, Payload, symbol>;

  onPrepare(fn: NonNullable<ActionRequest<Data, Response, Payload>['onPrepare']>): this;
  onSuccess(fn: NonNullable<ActionRequest<Data, Response, Payload>['onSuccess']>): this;
  onFail(fn: NonNullable<ActionRequest<Data, Response, Payload>['onFail']>): this;
}
