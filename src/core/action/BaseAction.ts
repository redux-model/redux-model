import { isDebug } from '../utils/dev';
import { Effects, Reducers } from '../utils/types';

export abstract class BaseAction<Data> {
  private static COUNTER = 0;

  protected readonly instanceName: string;

  protected successType: string;

  protected typePrefix: string;

  protected constructor(instanceName: string) {
    BaseAction.COUNTER += 1;
    this.instanceName = instanceName;
    this.typePrefix = this.getTypePrefix(BaseAction.COUNTER, instanceName);
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

  protected onTypePrefixChanged(): void {
    this.successType = `${this.typePrefix} success`;
  }

  private getTypePrefix(counter: number, name: string): string {
    // Do not concat counter in debug mode.
    if (!isDebug()) {
      name += `.${counter}`;
    }

    return name;
  }
}
