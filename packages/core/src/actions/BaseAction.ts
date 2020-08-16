import { Action } from 'redux';
import { BaseModel } from '../models/BaseModel';
import { isCompressed } from '../utils/isCompressed';

export interface IActionPayload<Payload = any, T = string> extends Action<T> {
  payload: Payload;
}

let actionCounter: number = 0;
export const increase = (): number => {
  return ++actionCounter;
};

export abstract class BaseAction<Data> {
  protected readonly model: BaseModel<Data>;
  protected _name?: string;
  protected _success?: string;

  declare private readonly _RMAction_: boolean;

  protected constructor(model: BaseModel<Data>) {
    this.model = model;
    isCompressed() && this.setName(increase());
  }

  public getSuccessType(): string {
    return this._success || this.assignName()._success!;
  }

  protected getName(): string {
    return this._name || this.assignName()._name!;
  }

  public/*protected*/ setName(name: string | number): void {
    this._name = this.model.getReducerName() + '_' + name;
    this._success = this._name + ' success';
  }

  protected assignName(): this {
    Object.keys(this.model).forEach((name) => {
      const customAction: BaseAction<any> = this.model[name];
      if (customAction && customAction._RMAction_) {
        customAction.setName(name);
      }
    });

    return this;
  }

  protected proxy(): this {
    const fn = this.action();
    // @ts-ignore
    const cache: { _m: string[]; _g: string[] } = this.constructor;
    const methods = cache._m || (cache._m = this.methods());
    const getters = cache._g || (cache._g = this.getters());

    methods.forEach((method) => {
      fn[method] = this[method].bind(this);
    });

    getters.forEach((property) => {
      Object.defineProperty(fn, property, {
        get: () => this[property],
      });
    });

    // @ts-ignore
    (fn as this)._RMAction_ = true;

    // @ts-ignore
    return fn;
  }

  protected methods(): string[] {
    return ['setName', 'getSuccessType'];
  }

  protected getters(): string[] {
    return [];
  }

  protected abstract action(): Function;
}
