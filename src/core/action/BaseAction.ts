import { Effects, Reducers } from '../utils/types';

export abstract class BaseAction<Data> {
  protected readonly instanceName: string;

  protected successType: string;

  protected typePrefix: string;

  protected constructor(instanceName: string) {
    this.instanceName = instanceName;
    this.typePrefix = instanceName;
    this.successType = `${this.typePrefix} success`;
  }

  public getSuccessType(): string {
    return this.successType;
  }

  public collectEffects(): Effects<Data> {
    return [];
  }

  public collectReducers(): Reducers {
    return {};
  }

  public setActionName(actionName: string | number) {
    this.typePrefix += `.${actionName}`;
    this.onTypePrefixChanged();
  }

  protected proxy(fn: Function, publicMethods: string[]) {
    // Only public method is required.
    for (const method of ['getSuccessType', 'collectEffects', 'collectReducers', 'setActionName']) {
      fn[method] = (...args: any[]) => {
        return this[method](...args);
      };
    }

    for (const method of publicMethods) {
      fn[method] = (...args: any[]) => {
        return this[method](...args);
      };
    }

    // Used for Proxy in BaseModel.ts
    fn['__isAction__'] = true;

    return fn;
  }

  protected onTypePrefixChanged(): void {
    this.successType = `${this.typePrefix} success`;
  }
}
