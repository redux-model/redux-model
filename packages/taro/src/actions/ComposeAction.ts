import * as ReactRedux from 'react-redux';
import { ComposeAction as BaseComponseAction, ComposeMeta } from '@redux-model/core';

export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseComponseAction<Data, Runner> {
  public useMeta(): ComposeMeta;
  public useMeta<T extends keyof ComposeMeta>(key: T): ComposeMeta[T];
  public useMeta<T extends keyof ComposeMeta>(key?: T): ComposeMeta | ComposeMeta[T] {
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
