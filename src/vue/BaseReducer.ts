import { BaseReducer as CoreBaseReducer } from '../core/reducer/BaseReducer';
import { ActionNormalHandle, ActionResponseHandle } from '../core/utils/types';
import { isDraftable } from 'immer';
import { StateReturnRequiredError } from '../core/exceptions/StateReturnRequiredError';

export class BaseReducer<Data> extends CoreBaseReducer<Data> {
  protected changeState(effect: Function, state: any, action: ActionResponseHandle | ActionNormalHandle) {
    const newState = effect(state, action);

    if (newState === undefined) {
      if (!isDraftable(state)) {
        throw new StateReturnRequiredError(action.type);
      }

      return state;
    }

    return newState;
  }
}
