import * as Vue from 'vue';
import { ComposeAction as BaseComponseAction, ComposeMeta } from '@redux-model/core';

export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseComponseAction<Data, Runner> {
  public useMeta(): Vue.ComputedRef<ComposeMeta>;
  public useMeta<T extends keyof ComposeMeta>(key?: T): Vue.ComputedRef<ComposeMeta[T]>;
  public useMeta<T extends keyof ComposeMeta>(key?: T): Vue.ComputedRef<ComposeMeta | ComposeMeta[T]> {
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
