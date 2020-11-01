import { AnyAction } from 'redux';
import { storeHelper } from './StoreHelper';
import ACTION_TYPES from '../utils/actionType';

/**
 * Reset store and reassign initial state for each model.
 * ```javascript
 * logout().then(() => {
 *   resetStore();
 * });
 * ```
 *
 * You can keep current state by override method `keepStateOnReset()`
 * ```javascript
 * class TestModel extends Model {
 *   protected keepOnResetStore() {
 *     return true;
 *   }
 * }
 * ```
 */
export const resetStore = (): AnyAction => {
  return storeHelper.dispatch({
    type: ACTION_TYPES.reset,
  });
};
