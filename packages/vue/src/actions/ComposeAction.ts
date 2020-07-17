import * as Vue from 'vue';
import { ComposeAction as BaseComponseAction, composeActionProxyKeys as superProxyKeys, Meta } from '../core';

export const composeActionProxyKeys: {
  methods: (keyof ComposeAction<any, any>)[];
} = {
  methods: ['useLoading', 'useMeta', ...superProxyKeys.methods],
};

export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseComponseAction<Data, Runner> {
  public useMeta(): Vue.ComputedRef<Meta>;
  public useMeta<T extends keyof Meta>(key?: T): Vue.ComputedRef<Meta[T]>;
  public useMeta<T extends keyof Meta>(key?: T): Vue.ComputedRef<Meta | Meta[T]> {
    return Vue.computed(() => {
      return key ? this.meta[key] : this.meta;
    });
  }

  public useLoading(): Vue.ComputedRef<boolean> {
    return this.useMeta('loading');
  }

  /**
   * @override
   */
  protected getProxyMethods(): string[] {
    return composeActionProxyKeys.methods;
  }
}
