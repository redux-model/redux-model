import { createDraft, finishDraft, isDraft, isDraftable } from 'immer';
import { ActionResponseHandle, Effects, Reducers, ActionNormalHandle } from '../utils/types';
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

  public getReducerName() {
    return this.instanceName;
  }

  public getCurrentReducerData(): Data {
    return getStore().getState()[this.getReducerName()];
  }

  public createData(): Reducers {
    const reducerName = this.getReducerName();

    return {
      [reducerName]: (state, action: ActionResponseHandle | ActionNormalHandle) => {
        if (state === undefined) {
          return this.initData;
        }

        // Actions
        if (action.reducerName === reducerName) {
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
