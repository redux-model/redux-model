import * as Vue from 'vue';
import { AxiosRequestConfig } from 'axios';
import { BaseRequestAction, HttpServiceBuilder, Meta, Metas } from '@redux-model/core';

export class RequestAction<Data, Builder extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, AxiosRequestConfig, M>, Response, Payload, M> extends BaseRequestAction<Data, Builder, Response, Payload, M> {
  public useMeta(): Vue.ComputedRef<Meta>;
  public useMeta<T extends keyof Meta>(key?: T): Vue.ComputedRef<Meta[T]>;
  public useMeta<T extends keyof Meta>(key?: T): Vue.ComputedRef<Meta | Meta[T]> {
    return Vue.computed(() => {
      return key ? this.meta[key] : this.meta;
    });
  }

  public useMetas(value: M): Vue.ComputedRef<Meta>;
  public useMetas<T extends keyof Meta>(value: M, metaKey: T): Vue.ComputedRef<Meta[T]>;
  public useMetas<T extends keyof Meta>(value: M, metaKey?: T): Vue.ComputedRef<Metas<M> | Meta | Meta[T]> {
    return Vue.computed(() => {
      const customMetas: Metas<M> = this.metas;
      const customMeta = customMetas.pick(value);

      return metaKey ? customMeta[metaKey] : customMeta;
    });
  }

  public useLoading(): Vue.ComputedRef<boolean> {
    return this.useMeta('loading');
  }

  public useLoadings(value: M): Vue.ComputedRef<boolean> {
    return this.useMetas(value, 'loading');
  }

  protected methods(): string[] {
    return super.methods().concat(
      'useMeta', 'useMetas', 'useLoading', 'useLoadings'
    );
  }
}
