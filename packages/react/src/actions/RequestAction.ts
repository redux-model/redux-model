import { AxiosRequestConfig } from 'axios';
import { BaseRequestAction, Meta, Metas, MetasLoading, HttpServiceBuilder, METAS_PICK_METHOD } from '@redux-model/core';
import * as ReactRedux from 'react-redux';

export class RequestAction<Data, Builder extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, AxiosRequestConfig, M>, Response, Payload, M> extends BaseRequestAction<Data, Builder, Response, Payload, M> {
  public useMeta(): Meta;
  public useMeta<T extends keyof Meta>(key: T): Meta[T];
  public useMeta<T extends keyof Meta>(key?: T): Meta | Meta[T] {
    return ReactRedux.useSelector(() => {
      return key ? this.meta[key] : this.meta;
    });
  }

  public useMetas(): Metas<M>;
  public useMetas(value: M): Meta;
  public useMetas<T extends keyof Meta>(value: M, metaKey: T): Meta[T];
  public useMetas<T extends keyof Meta>(value?: M, metaKey?: T): Metas<M> | Meta | Meta[T] {
    return ReactRedux.useSelector(() => {
      const customMetas: Metas<M> = this.metas;

      // For dev environment, user may append `.metas(value)` onto chain inside request action.
      // It means action will be converted from meta to metas. `pick` method will disappear by this way.
      if (!customMetas.pick) {
        customMetas.pick = METAS_PICK_METHOD.pick;
      }

      // Parameter `metaKey` is useless for metas when value is not provided.
      if (value === undefined) {
        return customMetas;
      }

      const customMeta = customMetas.pick(value);

      return metaKey ? customMeta[metaKey] : customMeta;
    });
  }

  public useLoading(): boolean {
    return this.useMeta('loading');
  }

  public useLoadings(): MetasLoading<M>;
  public useLoadings(value: M): boolean;
  public useLoadings(value?: M): boolean | MetasLoading<M> {
    return value === undefined
      ? this.getLoadingHandler(this.useMetas())
      : this.useMetas(value, 'loading');
  }

  protected methods(): string[] {
    return super.methods().concat(
      'useMeta', 'useMetas', 'useLoading', 'useLoadings'
    );
  }
}
