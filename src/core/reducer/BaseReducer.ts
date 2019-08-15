import { createDraft, finishDraft, isDraft, isDraftable } from 'immer';
import { Effects, Reducers } from '../utils/types';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';

export class BaseReducer<Data> {
  protected readonly initData: Data;

  protected cases: Effects<Data> = [];

  protected readonly instanceName: string;

  protected readonly suffix: string;

  protected currentReducerData: Data;

  constructor(init: Data, instanceName: string, suffix: string) {
    this.initData = init;
    this.currentReducerData = init;
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

  public getCurrentReducerData(): Data {
    return this.currentReducerData;
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
              const draft = createDraft(state);
              const responseDraft = effect(draft, action);

              if (responseDraft === undefined) {
                state = finishDraft(draft);
              } else if (isDraft(responseDraft)) {
                state = finishDraft(responseDraft);
              } else {
                state = responseDraft;
              }
            } else {
              state = effect(state, action);

              if (state === undefined) {
                throw new StateReturnRequiredError(when);
              }
            }
          }
        }

        this.currentReducerData = state;

        return state;
      },
    };
  }
}
