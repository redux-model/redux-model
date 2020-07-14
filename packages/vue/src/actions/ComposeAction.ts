import { ComposeAction as BaseComponseAction, composeActionProxyKeys as superProxyKeys } from '../core';

export const composeActionProxyKeys: {
  methods: (keyof ComposeAction<any, any>)[];
} = {
  methods: [...superProxyKeys.methods],
};

export class ComposeAction<Data, Runner extends (...args: any[]) => Promise<any>> extends BaseComponseAction<Data, Runner> {
  /**
   * @override
   */
  protected getProxyMethods(): string[] {
    return composeActionProxyKeys.methods;
  }
}
