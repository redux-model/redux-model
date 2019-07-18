export class BaseReducer<Data> {
  protected readonly initData: Data;

  protected cases: RM.Effects<Data> = [];

  protected readonly instanceName: string;

  protected readonly suffix: string;

  constructor(init: Data, instanceName: string, suffix: string) {
    this.initData = init;
    this.instanceName = instanceName;
    this.suffix = suffix;
  }

  public clear() {
    this.cases = [];
  }

  public addCase(...config: RM.Effects<Data>) {
    this.cases.push(...config);
  }

  public getReducerName() {
    return `${this.instanceName}__${this.suffix}`;
  }

  public createData(): RM.Reducers {
    return {
      [this.getReducerName()]: (state, action) => {
        if (state === undefined) {
          state = this.initData;
        }

        for (const { when, effect } of this.cases) {
          if (when === action.type) {
            return effect(state, action);
          }
        }

        return state;
      },
    };
  }
}
