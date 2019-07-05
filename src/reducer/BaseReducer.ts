export class BaseReducer<Data> {
  protected readonly initData: Data;

  protected cases: RM.ReducerEffects<Data> = [];

  protected readonly instanceName: string;

  constructor(init: Data, instanceName: string) {
    this.initData = init;
    this.instanceName = instanceName;
  }

  public clear() {
    this.cases = [];
  }

  // TODO: use typeof keyof
  public addCase(...config: RM.ReducerEffects<Data>) {
    this.cases.push(...config);
  }

  public getReducerName() {
    return `${this.instanceName}__data`;
  }

  public createData(): RM.HookRegister {
    return {
      [this.getReducerName()]: (state, action) => {
        if (!state) {
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
