import { Action } from 'redux';
import { BaseModel } from '../models/BaseModel';
import { isCompressed } from '../utils/isCompressed';
import { setActionName, getActionCounter } from '../utils/setActionName';

export interface IActionPayload<Payload = any, T = string> extends Action<T> {
  payload: Payload;
}

export abstract class BaseAction<Data> {
  public/*protected*/ readonly model: BaseModel<Data>;
  protected _name?: string;
  protected _success?: string;

  declare public/*private*/ readonly _RMAction_: boolean;

  protected constructor(model: BaseModel<Data>) {
    this.model = model;

    if (isCompressed()) {
      this.setName(getActionCounter());
    }
  }

  public getSuccessType(): string {
    return this._success || setActionName(this)._success!;
  }

  public/*protected*/ getName(): string {
    return this._name || setActionName(this)._name!;
  }

  public/*protected*/ setName(name: string | number): void {
    this._name = this.model.getReducerName() + '_' + name;
    this._success = this._name + ' success';
  }

  protected proxy(): this {
    const fn = this.action();
    // @ts-ignore
    const cache: { __methods: string[]; __getters: string[] } = this.constructor;
    const methods = cache.__methods || (cache.__methods = this.methods(), cache.__methods);
    const getters = cache.__getters || (cache.__getters = this.getters(), cache.__getters);

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
