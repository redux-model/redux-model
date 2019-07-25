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
              const draft = createDraft(state);
              const responseDraft = effect(draft, action);

              if (responseDraft === undefined) {
                return finishDraft(draft);
              }

              if (isDraft(responseDraft)) {
                return finishDraft(responseDraft);
              }

              // Both original data and return data changed.
              if (finishDraft(draft) !== state) {
                console.warn(`[${this.instanceName}] You should either modify state or return new state. Do not effect both at the same time.`);

                // Make sure here is no immer type in new data's property.
                return isDraftable(responseDraft) ? finishDraft(createDraft(responseDraft)) : responseDraft;
              }

              return responseDraft;
            }

            const response = effect(state, action);

            return response === undefined ? state: response;
          }
        }

        return state;
      },
    };
  }
}
