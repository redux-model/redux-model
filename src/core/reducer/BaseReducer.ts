import { createDraft, finishDraft, isDraft, isDraftable } from 'immer';
import { ActionResponseHandle, Effects, Reducers, ActionNormalHandle } from '../utils/types';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';
import { getStore } from '../utils/createReduxStore';

export class BaseReducer<Data> {
  protected readonly initData: Data;

  protected cases: Effects<Data> = [];

  protected readonly reducerName: string;

  constructor(init: Data, instanceName: string) {
    this.initData = init;
    this.reducerName = instanceName;
  }

  public clear() {
    this.cases = [];
  }

  public addCase(...config: Effects<Data>) {
    this.cases.push(...config);
  }

  public getData(): Data {
    return getStore().getState()[this.reducerName];
  }

  public createData(): Reducers {
    return {
      [this.reducerName]: (state, action: ActionResponseHandle | ActionNormalHandle) => {
        if (state === undefined) {
          return this.initData;
        }

        // Actions
        if (action.reducerName === this.reducerName) {
          if (action.effect) {
            return this.changeState(action.effect, state, action);
          }
        } else if (this.cases.length) {
          // Effects
          for (const { when, effect } of this.cases) {
            if (when === action.type) {
              return this.changeState(effect, state, action);
            }
          }
        }

        return state;
      },
    };
  }

  protected changeState(effect: Function, state: any, action: ActionResponseHandle | ActionNormalHandle): any {
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
