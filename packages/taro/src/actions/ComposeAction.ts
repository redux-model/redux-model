import * as ReactRedux from 'react-redux';
import { ComposeAction as BaseComponseAction, Meta } from '@redux-model/core';

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
  protected methods(): string[] {
    return super.methods().concat('useMeta', 'useLoading');
  }
}
