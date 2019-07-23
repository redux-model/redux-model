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

  protected onTypePrefixChanged(): void {
    this.successType = `${this.typePrefix} success`;
  }
}
