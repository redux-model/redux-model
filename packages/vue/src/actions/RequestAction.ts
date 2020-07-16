import * as Vue from 'vue';
import { AxiosRequestConfig } from 'axios';
import { BaseRequestAction, HttpServiceBuilder, requestActionProxyKeys as superProxyKeys, Meta, Metas, MetasLoading } from '../core';

export const requestActionProxyKeys: {
  methods: (keyof RequestAction<any, any, any, any, any>)[];
} = {
  methods: [...superProxyKeys.methods],
};

export class RequestAction<Data, Builder extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, AxiosRequestConfig, M>, Response, Payload, M> extends BaseRequestAction<Data, Builder, Response, Payload, M> {
  public useMeta(): Vue.ComputedRef<Meta>;
  public useMeta<T extends keyof Meta>(key?: T): Vue.ComputedRef<Meta[T]>;
  public useMeta<T extends keyof Meta>(key?: T): Vue.ComputedRef<Meta | Meta[T]> {
    return Vue.computed(() => {
      return key ? this.meta[key] : this.meta;
    });
  }

  public useMetas(): Vue.ComputedRef<Metas<M>>;
  public useMetas(value: M): Vue.ComputedRef<Meta>;
  public useMetas<T extends keyof Meta>(value: M, metaKey: T): Vue.ComputedRef<Meta[T]>;
  public useMetas<T extends keyof Meta>(value?: M, metaKey?: T): Vue.ComputedRef<Metas<M> | Meta | Meta[T]> {
    return Vue.computed(() => {
      const customMetas: Metas<M> = this.metas;

      // Parameter `metaKey` is useless for metas when value is not provided.
      if (value === undefined) {
        return customMetas;
      }

      const customMeta = customMetas.pick(value);

      return metaKey ? customMeta[metaKey] : customMeta;
    });
  }

  public useLoading(): Vue.ComputedRef<boolean> {
    return this.useMeta('loading');
  }

  public useLoadings(): Vue.ComputedRef<MetasLoading<M>>;
  public useLoadings(value: M): Vue.ComputedRef<boolean>;
  public useLoadings(value?: M): Vue.ComputedRef<boolean | MetasLoading<M>> {
    return value === undefined
      ? this._getLoadingHandler(this.useMetas())
      : this.useMetas(value, 'loading');
  }

  protected _getLoadingHandler(metas: Vue.ComputedRef<Metas<M>>): Vue.ComputedRef<MetasLoading<M>> {
    // @ts-ignore
    return this.getLoadingHandler(metas);
  }

  protected getProxyMethods(): string[] {
    return requestActionProxyKeys.methods;
  }
}
