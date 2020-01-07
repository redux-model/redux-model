import { createDraft, finishDraft, isDraft, isDraftable } from 'immer';
import { ActionResponseHandle, Effects, Reducers, ActionNormalHandle } from '../utils/types';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';
import { getState } from '../utils/store';
import { TYPE_REHYDRATE, switchInitData } from '../utils/persist';

export class BaseReducer<Data> {
  protected readonly initData: Data;

  protected cases: Effects<Data> = [];

  protected readonly reducerName: string;

  protected readonly filterPersistData?: (data: Data) => Data | void;

  constructor(init: Data, instanceName: string, filterPersistData?: (data: Data) => Data | void) {
    this.initData = init;
    this.reducerName = instanceName;
    this.filterPersistData = filterPersistData;
  }

  public clear() {
    this.cases = [];
  }

  public addCase(...config: Effects<Data>) {
    this.cases.push(...config);
  }

  public getData(): Data {
    return getState()[this.reducerName];
  }

  public createData(): Reducers {
    return {
      [this.reducerName]: (state, action: ActionResponseHandle | ActionNormalHandle) => {
        if (state === undefined) {
          const newState = switchInitData(this.reducerName, this.initData);

          return newState === this.initData ? newState : this.persistState(newState);
        }

        // For async storage, we should dispatch action to inject persist data into reducer
        if (action.type === TYPE_REHYDRATE && action.payload[this.reducerName] !== undefined) {
          return this.persistState(action.payload[this.reducerName]);
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

  protected persistState(state: any): any {
    if (!this.filterPersistData) {
      return state;
    }

    if (isDraftable(state)) {
      const draft = createDraft(state);
      const responseDraft = this.filterPersistData(draft);

      if (responseDraft === undefined) {
        state = finishDraft(draft);
      } else if (isDraft(responseDraft)) {
        state = finishDraft(responseDraft);
      } else {
        state = responseDraft;
      }
    } else {
      state = this.filterPersistData(state);

      if (state === undefined) {
        throw new StateReturnRequiredError('filterPersistData');
      }
    }

    return state;
  };

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
