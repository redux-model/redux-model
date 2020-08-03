import { Effects, FilterPersist } from '../models/BaseModel';
import { InternalSuccessAction } from '../actions/BaseRequestAction';
import { IActionNormal } from '../actions/NormalAction';
import { isDraftable, createDraft, finishDraft, isDraft } from 'immer';
import { storeHelper } from '../stores/StoreHelper';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';
import ACTION_TYPES from '../utils/actionType';

export interface IReducers {
  [key: string]: (state: any, action: any) => any;
}

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

  protected reducer(state: Data | undefined, action: InternalSuccessAction<Data> | IActionNormal<Data>): Data {
    if (state === undefined) {
      const newState = storeHelper.persist.getPersistData(this.name, this.initData);
      return this.initFromPersist(newState);
    }

    const actionType = action.type;

    // For async storage, we should dispatch action to inject persist data into reducer
    if (actionType === ACTION_TYPES.persist && action.payload && action.payload[this.name] !== undefined) {
      return this.initFromPersist(action.payload[this.name]);
    }

    if (this.after[actionType]) {
      setTimeout(() => {
        this.after[actionType].fn(action);
      }, this.after[actionType].duration);
    }

    if (action.modelName === this.name) {
      if (action.after) {
        setTimeout(() => {
          action.after!(action);
        }, action.afterDuration);
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

  protected changeState(effect: Function, state: any, action: InternalSuccessAction<Data> | IActionNormal<Data>): any {
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
