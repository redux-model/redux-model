export abstract class BaseAction<Data> {
  private static COUNTER = 0;

  protected readonly successType: string;

  protected readonly typePrefix: string;

  protected constructor(instanceName: string) {
    BaseAction.COUNTER += 1;
    this.typePrefix = this.getTypePrefix(BaseAction.COUNTER, instanceName);
    this.successType = `${this.typePrefix}_success`;
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

  private getTypePrefix(counter: number, name: string): string {
    // Do not concat counter in dev mode.
    if (typeof module === 'undefined' || !module.hot) {
      name += `.${counter}`;
    }

    return name;
  }
}
