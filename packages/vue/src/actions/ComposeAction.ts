import * as Vue from 'vue';
import { ComposeAction as BaseComponseAction, Meta } from '@redux-model/core';

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
  protected methods(): string[] {
    return super.methods().concat('useLoading', 'useMeta');
  }
}
