import { isDebug } from '../utils/dev';

export abstract class BaseAction<Data> {
  private static COUNTER = 0;

  protected successType: string;

  protected typePrefix: string;

  protected constructor(instanceName: string) {
    BaseAction.COUNTER += 1;
    this.typePrefix = this.getTypePrefix(BaseAction.COUNTER, instanceName);
    this.successType = `${this.typePrefix} success`;
  }

  public getSuccessType(): string {
    return this.successType;
  }

  public collectEffects(): RM.Subscriber<Data> {
    return [];
  }

  public collectReducers(): RM.Reducers {
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
