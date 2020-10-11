import { storeHelper } from '../stores/StoreHelper';

const ssrName = '_redux_model_ssr_initial_state_';
const initName = '_initial_state_';

export const appendInitialStateToReducer = <T extends Function>(reducer: T, initialState: any): T => {
  reducer[initName] = initialState;
  return reducer;
};

export const fromSSR = (): object | undefined => {
  if (typeof window === 'object' && typeof window[ssrName] === 'object') {
    return window[ssrName];
  }

  return;
};

/**
 * Generate ssr string for preloaded state. The literal looks like:
 * ```javascript
 * window['_redux_model_ssr_initial_state_'] = {"counterModel": {"count": 1}};
 * ```
 */
export const createSSR = (): string => {
  const finalState = {};
  const state = storeHelper.getState();
  const reducers = storeHelper.reducers;

  Object.keys(state).forEach((key) => {
    if (state[key] !== reducers[key][initName]) {
      finalState[key] = state[key];
    }
  });

  return `window['${ssrName}'] = ${JSON.stringify(finalState)};`;
};
