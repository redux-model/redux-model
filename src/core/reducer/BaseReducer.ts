import { createDraft, finishDraft, isDraft, isDraftable } from 'immer';
import { InternalActionHandle, Effects, Reducers } from '../utils/types';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';
import { getStore } from '../utils/createReduxStore';

export class BaseReducer<Data> {
  protected readonly initData: Data;

  protected cases: Effects<Data> = [];

  protected readonly instanceName: string;

  constructor(init: Data, instanceName: string) {
    this.initData = init;
    this.instanceName = instanceName;
  }

  public clear() {
    this.cases = [];
  }

  public addCase(...config: Effects<Data>) {
    this.cases.push(...config);
  }

  public changeCase(when: Effects<Data>[number]['when'], effect: Effects<Data>[number]['effect']) {
    for (const item of this.cases) {
      if (item.when === when) {
        item.effect = effect;
        break;
      }
    }
  }

  public getReducerName() {
    return this.instanceName;
  }

  public getCurrentReducerData(): Data {
    return getStore().getState()[this.getReducerName()];
  }

  public createData(): Reducers {
    return {
      [this.getReducerName()]: (state, action: InternalActionHandle) => {
        if (state === undefined) {
          state = this.initData;
        }

        if (action.instanceName === this.instanceName) {
          if (action.effect) {
            state = this.changeState(action.effect, state, action);
          }
        } else {
          for (const { when, effect } of this.cases) {
            if (when === action.type) {
              state = this.changeState(effect, state, action);
            }
          }
        }

        return state;
      },
    };
  }

  protected changeState(effect: Function, state: any, action: InternalActionHandle): any {
    if (isDraftable(state)) {
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
        throw new StateReturnRequiredError(action.type);
      }
    }

    return state;
  }
}
