import { Action } from 'redux';
import { BaseModel } from '../models/BaseModel';
import { isCompressed } from '../utils/isCompressed';
import { setActionName, increaseActionCounter } from '../utils/setActionName';

export interface IActionPayload<Payload = any, T = string> extends Action<T> {
  payload: Payload;
}

export const actionProxyKeys: {
  methods: (keyof BaseAction<any>)[];
  getters: (keyof BaseAction<any>)[];
} = {
  methods: ['setName', 'getSuccessType'],
  getters: [],
};

export abstract class BaseAction<Data> {
  public/*protected*/ readonly model: BaseModel<Data>;
  protected instanceName: string = '';
  protected __successType?: string;

  declare public/*private*/ readonly __isAction__: boolean;

  protected constructor(model: BaseModel<Data>) {
    this.model = model;

    if (isCompressed) {
      this.setName(increaseActionCounter());
    }
  }

  public getSuccessType(): string {
    return this.__successType || (setActionName(this), this.__successType!);
  }

  public/*protected*/ getActionName(): string {
    return this.instanceName || (setActionName(this), this.instanceName);
  }

  public/*protected*/ setName(name: string | number): void {
    this.instanceName = this.model.getReducerName() + '_' + name;
    this.__successType = this.instanceName + ' success';
  }

  protected proxy(): this {
    const methods = {};
    const fn = this.getProxyFn();

    for (const method of this.getProxyMethods()) {
      methods[method] = this[method].bind(this);
      Object.defineProperty(fn, method, {
        get: () => methods[method],
      });
    }

    for (const property of this.getProxyGetters()) {
      Object.defineProperty(fn, property, {
        get: () => this[property],
      });
    }

    // @see Action.__isAction__
    fn['__isAction__'] = true;

    // @ts-ignore
    // @ts-expect-error
    return fn;
  }

  protected getProxyMethods(): string[] {
    return actionProxyKeys.methods;
  }

  protected getProxyGetters(): string[] {
    return actionProxyKeys.getters;
  }

  protected abstract getProxyFn(): Function;
}
