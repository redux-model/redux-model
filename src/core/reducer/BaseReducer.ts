import { createDraft, finishDraft, isDraft, isDraftable } from 'immer';
import { Effects, Reducers } from '../utils/types';

export class BaseReducer<Data> {
  protected readonly initData: Data;

  protected cases: Effects<Data> = [];

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

  public addCase(...config: Effects<Data>) {
    this.cases.push(...config);
  }

  public getReducerName() {
    return `${this.instanceName}__${this.suffix}`;
  }

  public createData(useImmer: boolean): Reducers {
    return {
      [this.getReducerName()]: (state, action) => {
        if (state === undefined) {
          state = this.initData;
        }

        for (const { when, effect } of this.cases) {
          if (when === action.type) {
            if (useImmer && isDraftable(state)) {
              const responseDraft = effect(createDraft(state), action);
              let newState: Data = responseDraft;

              if (isDraft(responseDraft)) {
                newState = finishDraft(responseDraft) as Data;
              }

              return newState;
            }

            return effect(state, action);
          }
        }

        return state;
      },
    };
  }
}
