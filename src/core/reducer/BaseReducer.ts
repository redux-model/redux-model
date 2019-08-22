import { createDraft, finishDraft, isDraft, isDraftable } from 'immer';
import { Effects, Reducers } from '../utils/types';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';

export class BaseReducer<Data> {
  protected readonly initData: Data | (() => Data);

  protected cases: Effects<Data> = [];

  protected readonly instanceName: string;

  protected currentReducerData: Data | undefined = undefined;

  constructor(init: Data | (() => Data), instanceName: string) {
    this.initData = init;
    this.instanceName = instanceName;
  }

  public clear() {
    this.cases = [];
  }

  public addCase(...config: Effects<Data>) {
    this.cases.push(...config);
  }

  public getReducerName() {
    return this.instanceName;
  }

  public getCurrentReducerData(): Data {
    return this.currentReducerData!;
  }

  public createData(useImmer: boolean): Reducers {
    return {
      [this.getReducerName()]: (state, action) => {
        if (state === undefined) {
          state = typeof this.initData === 'function' ? (this.initData as Function)() : this.initData;
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
