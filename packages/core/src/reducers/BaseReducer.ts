import { Effects, FilterPersist } from '../models/BaseModel';
import { InternalSuccessAction } from '../actions/BaseRequestAction';
import { IActionNormal } from '../actions/NormalAction';
import { isDraftable, createDraft, finishDraft, isDraft } from 'immer';
import { storeHelper } from '../stores/StoreHelper';
import { StateReturnRequiredError } from '../exceptions/StateReturnRequiredError';
import { ACTION_TYPE_REHYDRATE } from '../utils/actionType';

export interface IReducers {
  [key: string]: (state: any, action: any) => any;
}

export class BaseReducer<Data> {
  protected readonly initData: Data;
  protected readonly reducerName: string;
  protected readonly sideEffects: Record<string, Effects<Data>[number]['effect']> = {};
  protected readonly filterPersistData?: FilterPersist<Data>;

  constructor(reducerName: string, initData: Data, effects: Effects<Data>, filterPersistData?: FilterPersist<Data>) {
    this.initData = initData;
    this.reducerName = reducerName;
    this.sideEffects = effects.reduce((carry, { when, effect }) => {
      carry[when] = effect;
      return carry;
    }, {} as Record<string, Effects<Data>[number]['effect']>);
    this.filterPersistData = filterPersistData;
  }

  public createReducer(): IReducers {
    if (this.initData === null) {
      return {};
    }

    return {
      [this.reducerName]: this.reducer.bind(this),
    };
  }

  protected reducer(state: Data | undefined, action: InternalSuccessAction<Data> | IActionNormal<Data>): Data {
    if (state === undefined) {
      const newState = storeHelper.persist.getPersistData(this.reducerName, this.initData);
      return this.initFromPersist(newState);
    }

    // For async storage, we should dispatch action to inject persist data into reducer
    if (action.type === ACTION_TYPE_REHYDRATE && action.payload && action.payload[this.reducerName] !== undefined) {
      return this.initFromPersist(action.payload[this.reducerName]);
    }

    if (action.modelName === this.reducerName) {
      if (action.effect) {
        return this.changeState(action.effect, state, action);
      }
    } else if (this.sideEffects[action.type]) {
      return this.changeState(this.sideEffects[action.type], state, action);
    }

    return state;
  }

  protected initFromPersist(state: any): any {
    if (this.initData === state || !this.filterPersistData) {
      return state;
    }

    return this.changeState(this.filterPersistData, state, {
      type: 'filterPersistData',
      modelName: this.reducerName,
      payload: undefined,
      effect: this.filterPersistData,
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
