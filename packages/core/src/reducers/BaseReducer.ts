import { Action } from 'redux';
import { Effects, FilterPersist } from '../models/BaseModel';
import { RequestSuccessAction, RequestFailAction } from '../actions/BaseRequestAction';
import { IActionNormal } from '../actions/NormalAction';
import { isDraftable, createDraft, finishDraft, isDraft } from 'immer';
import { storeHelper } from '../stores/StoreHelper';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';
import ACTION_TYPES from '../utils/actionType';
import { IPersistRehydrate } from '../stores/Persist';

export interface IReducers {
  [key: string]: (state: any, action: any) => any;
}

type AllAction<Data> = RequestSuccessAction<Data> | RequestFailAction<Data> | IActionNormal<Data>;

export class BaseReducer<Data> {
  protected readonly initData: Data;
  protected readonly name: string;
  protected readonly cases: Record<string, NonNullable<Effects<Data>[number]['then']>>;
  protected readonly after: Record<string, {
    fn: NonNullable<Effects<Data>[number]['after']>;
    duration?: number;
  }>;
  protected readonly filterPersist: FilterPersist<Data>;

  constructor(reducerName: string, initData: Data, effects: Effects<Data>, filterPersistData: FilterPersist<Data>) {
    this.initData = initData;
    this.name = reducerName;
    this.cases = {};
    this.after = {};

    effects.forEach(({ when, then, after, duration }) => {
      if (then) {
        this.cases[when] = then;
      }

      if (after) {
        this.after[when] = {
          fn: after,
          duration,
        };
      }
    });
    this.filterPersist = filterPersistData;
  }

  public createReducer(): IReducers {
    if (this.initData === null) {
      return {};
    }

    return {
      [this.name]: this.reducer.bind(this),
    };
  }

  protected isPersist(action: Action<string>): action is IPersistRehydrate {
    return action.type === ACTION_TYPES.persist;
  }

  protected reducer(state: Data | undefined, action: AllAction<Data> | IPersistRehydrate): Data {
    if (state === undefined) {
      const newState = storeHelper.persist.getPersistData(this.name, this.initData);
      return this.initFromPersist(newState);
    }

    const actionType = action.type;

    // Only subscriber can receive this action
    if (this.isPersist(action)) {
      if (action.payload[this.name] !== undefined) {
        return this.initFromPersist(action.payload[this.name]);
      }

      return state;
    }

    if (this.after[actionType]) {
      const currentAfter = this.after[actionType];
      setTimeout(currentAfter.fn, currentAfter.duration, action);
    }

    if (action.modelName === this.name) {
      if (action.after) {
        setTimeout(action.after, action.afterDuration, action);
      }

      if (action.effect) {
        return this.changeState(action.effect, state, action);
      }
    } else if (this.cases[actionType]) {
      return this.changeState(this.cases[actionType], state, action);
    }

    return state;
  }

  protected initFromPersist(state: any): any {
    if (this.initData === state || !this.filterPersist) {
      return state;
    }

    return this.changeState(this.filterPersist, state, {
      type: 'filterPersistData',
      modelName: this.name,
      payload: undefined,
      effect: this.filterPersist,
      after: null,
    });
  };

  protected changeState(effect: Function, state: any, action: AllAction<Data>): any {
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
