import { ComposeAction as BaseComponseAction, Meta, composeActionProxyKeys as superProxyKeys } from '../core';
import * as ReactRedux from 'react-redux';

export const composeActionProxyKeys: {
  methods: (keyof ComposeAction<any, any>)[];
} = {
  methods: ['useMeta', 'useLoading', ...superProxyKeys.methods],
};

export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseComponseAction<Data, Runner> {
  public useMeta(): Meta;
  public useMeta<T extends keyof Meta>(key?: T): Meta[T];
  public useMeta<T extends keyof Meta>(key?: T): Meta | Meta[T] {
    return ReactRedux.useSelector(() => {
      return key ? this.meta[key] : this.meta;
    });
  }

  public useLoading(): boolean {
    return this.useMeta('loading');
  }

  /**
   * @override
   */
  protected getProxyMethods(): string[] {
    return composeActionProxyKeys.methods;
  }
}
