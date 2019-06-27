export abstract class Model<Data> {
  private static COUNTER = 0;

  protected readonly successType: string;

  protected readonly typePrefix: string;

  // The parameter `name` can make different instance.
  constructor(instanceName: string = '') {
    Model.COUNTER += 1;
    this.typePrefix = this.getTypePrefix(Model.COUNTER, instanceName);
    this.successType = `${this.typePrefix} success`;
  }

  public getSuccessType(): string {
    return this.successType;
  }

  public createData(): (state: any, action: any) => Data {
    const effects = this.getEffects();

    return (state, action) => {
      if (!state) {
        state = this.getInitValue();
      }

      if (this.successType === action.type) {
        return this.onSuccess(state, action);
      }

      for (const { when, effect } of effects) {
        if (when === action.type) {
          return effect(state, action);
        }
      }

      return state;
    };
  }

  protected getEffects(): RM.ReducerEffects<Data> {
    return [];
  }

  protected abstract getInitValue(): Data;

  protected abstract onSuccess(state: Data, action: any): Data;

  private getTypePrefix(counter: number, instanceName: string): string {
    // Constructor name will be random string after uglify.
    // So we should add counter to recognize them.
    let name = this.constructor.name;

    // Do not concat counter in dev mode.
    if (!module.hot) {
      name += `::${counter}::`;
    }

    return `${name}__${instanceName}`;
  }
}
