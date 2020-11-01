import { Subscriptions, FilterPersist, AnyModel } from '../models/BaseModel';
import { RequestSuccessAction, RequestFailAction, RequestPrepareAction } from '../actions/BaseRequestAction';
import { IActionNormal } from '../actions/NormalAction';
import { isDraftable, createDraft, finishDraft, isDraft, enableES5, enableMapSet } from 'immer';
import { storeHelper } from '../stores/StoreHelper';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';
import ACTION_TYPES from '../utils/actionType';

// Since immer@6, support for the fallback implementation has to be explicitly enabled by calling enableES5()
// https://immerjs.github.io/immer/docs/installation#pick-your-immer-version
enableES5();
// We can't stop developer to use Map and Set in redux.
enableMapSet();

export interface IReducers {
  [key: string]: (state: any, action: any) => any;
}

type AllAction<Data> = RequestPrepareAction<Data> | RequestSuccessAction<Data> | RequestFailAction<Data> | IActionNormal<Data>;

export class BaseReducer<Data> {
  protected readonly model?: AnyModel;
  protected readonly initialState: Data;
  protected readonly name: string;
  protected readonly cases: Record<string, NonNullable<Subscriptions<Data>[number]['then']>>;
  protected readonly after: Record<string, {
    fn: NonNullable<Subscriptions<Data>[number]['after']>;
    duration?: number;
  }>;
  protected readonly filterPersist: FilterPersist<Data>;
  protected readonly keepOnReset: boolean;

  constructor(reducerName: string, initialState: Data, model?: AnyModel) {
    this.model = model;
    this.initialState = initialState;
    this.name = reducerName;
    this.cases = {};
    this.after = {};

    model && model.subscriptions().forEach(({ when, then, after, duration }) => {
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
    this.filterPersist = model ? model.filterPersistData() : null;
    this.keepOnReset = model ? model.keepOnResetStore() : false;
  }

  public createReducer(): IReducers {
    if (this.initialState === null) {
      return {};
    }

    return {
      [this.name]: this.reducer.bind(this),
    };
  }

  protected reducer(state: Data | undefined, action: AllAction<Data>): Data {
    if (state === undefined) {
      const newState = storeHelper.persist.subscribe(this.name);
      return newState === undefined ? this.initialState : this.initFromPersist(newState);
    }

    const actionType = action.type;

    // Only subscriber can receive this action
    if (actionType === ACTION_TYPES.persist) {
      const newState = action.payload[this.name];
      return newState === undefined ? state : this.initFromPersist(newState);
    }

    if (actionType === ACTION_TYPES.reset) {
      return this.keepOnReset ? state : this.initialState;
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
    const filter = this.filterPersist;

    if (!filter) {
      return state;
    }

    return this.changeState(filter, state, {
      type: 'filterPersistData',
      modelName: this.name,
      payload: undefined,
      effect: filter,
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
